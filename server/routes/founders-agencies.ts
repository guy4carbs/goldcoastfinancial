/**
 * Founders Agency Management — backend routes.
 *
 * All endpoints are gated `requireAuth + requireRole(...FOUNDERS_ONLY)` at the
 * router level (Wave Y tightening — founders are the only role with access to
 * the Founders Lounge; Owner + System Admin no longer hit /founders/*). Every
 * write emits `logFounderAction(...)`.
 *
 * Endpoint surface (mounted under /api/founders, so paths look like
 * /api/founders/agencies/... and /api/founders/carriers/...):
 *
 *   GET    /agencies/kpis?period=
 *   GET    /agencies/tree
 *   GET    /agencies/entity-stats
 *   GET    /agencies/entity-roster
 *   GET    /agencies/formation-guide?state=XX
 *   GET    /agencies/:id
 *   POST   /agencies
 *   PATCH  /agencies/:id
 *   DELETE /agencies/:id
 *   POST   /agencies/:id/teams
 *   GET    /agencies/:id/carriers
 *   POST   /agencies/:id/carriers
 *   PATCH  /agencies/:id/carriers/:contractId
 *   DELETE /agencies/:id/carriers/:contractId
 *   GET    /agencies/:id/overrides
 *   POST   /agencies/:id/overrides
 *   DELETE /agencies/:id/overrides/:overrideId
 *   POST   /carriers
 *   PATCH  /carriers/:id
 *   GET    /carriers/:id/compliance
 *   POST   /carriers/:id/compliance
 *   DELETE /carriers/:id/compliance/:reqId
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole, FOUNDERS_ONLY, blockWritesDuringViewAs } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { ROOT_AGENCY_ID } from "../services/agencyResolver";
import { genericError } from "./founders-book";
import { HIERARCHY_TITLES } from "../../shared/models/enterprise";
import {
  emitHierarchyChanged,
  emitRoleChanged,
} from "../services/foundersEventBus";
import { titleToRole } from "../services/hierarchyRoleMap";
import { reinitializeLoungeAccess } from "../services/loungeAccessSync";
import { storage } from "../storage";
import {
  sendFormationGuideEmail,
  renderFormationGuideHtml,
  type FormationGuideStateData,
  type FormationChecklistItem,
} from "../services/emailTemplates/formationGuide";

const router = Router();
// Founders Lounge gate. Wave Y tightened from ADMIN_PLUS → FOUNDERS_ONLY per
// founder mandate: Owner has access to everything in goldcoast EXCEPT the
// Founders Lounge. System Admin's surfaces are the Admin HCMS + Ops Hub, not
// the Founders Lounge. Founder is the only role that hits these endpoints.
router.use(requireAuth, requireRole(...FOUNDERS_ONLY));

// ─── Rate limiters for formation-guide endpoints (Sentinel HIGH) ─────────
// Send is rate-limited per founder (10/hr) to prevent accidental or malicious
// blast emails. Preview is rate-limited at 30/min to avoid render-loop abuse
// while still feeling responsive in the founder UI.
const formationGuideSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // 10 sends per hour per founder
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.id || req.ip,
  message: {
    error: "Too many formation guide sends. Try again in an hour.",
    code: "RATE_LIMITED",
  },
});

const formationGuidePreviewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.id || req.ip,
});

// ─── Utility helpers ─────────────────────────────────────────────────────────

const VALID_AGENCY_STATUS = new Set(["active", "suspended", "terminated"]);
const VALID_CONTRACT_STATUS = new Set([
  "active",
  "pending",
  "suspended",
  "terminated",
]);
const VALID_REQ_TYPE = new Set([
  "aml_training",
  "eo_minimum",
  "state_excluded",
  "background_check",
  "training_module",
]);

// UUID v1-v5 (case-insensitive). Anchors on full string.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(v: any): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function viewingAsOf(req: any): string | null {
  return (req?.session as any)?.viewingAs || null;
}

// Mask EIN to last-4 form.
function maskEin(ein: string | null): string | null {
  if (!ein) return null;
  const digits = String(ein).replace(/\D/g, "");
  if (digits.length === 0) return null;
  if (digits.length <= 4) return `***${digits}`;
  return `***${digits.slice(-4)}`;
}

// ─── Cycle prevention (BFS) ─────────────────────────────────────────────────
//
// Mirrors the pattern used in hcms-hierarchy.ts: walk the descendant set of
// `candidateChildId` (the agency that wants to be re-parented) and ensure
// `proposedParentId` is NOT in that set. Returns true when the assignment
// would create a cycle.
async function wouldCreateCycle(
  candidateChildId: string,
  proposedParentId: string,
): Promise<boolean> {
  if (candidateChildId === proposedParentId) return true;
  const seen = new Set<string>([candidateChildId]);
  let frontier: string[] = [candidateChildId];
  const MAX_DEPTH = 50;
  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const r = await pool.query(
      `SELECT id::text AS id
         FROM agencies
        WHERE parent_agency_id = ANY($1::uuid[])`,
      [frontier],
    );
    const next: string[] = [];
    for (const row of r.rows) {
      const id: string = row.id;
      if (id === proposedParentId) return true;
      if (!seen.has(id)) {
        seen.add(id);
        next.push(id);
      }
    }
    frontier = next;
  }
  return false;
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

router.get("/agencies/kpis", async (_req, res) => {
  try {
    // Parallelize the 4 small COUNT queries.
    const [agenciesRes, contractsRes, entityRes, pendingRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS n FROM agencies WHERE status = 'active'`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM agency_carrier_contracts WHERE status = 'active'`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n
           FROM agent_profiles
          WHERE dba_type = 'business_entity'
            AND company_type IS NOT NULL`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n
           FROM agent_contracting_requests
          WHERE status IN ('draft', 'awaiting_carrier')`,
      ),
    ]);
    // Field names match the FoundersAgencyManagement.tsx `AgencyKPIs` interface.
    res.json({
      agenciesCount: Number(agenciesRes.rows[0]?.n) || 0,
      carriersContractedCount: Number(contractsRes.rows[0]?.n) || 0,
      agentsWithEntity: Number(entityRes.rows[0]?.n) || 0,
      pendingCarrierRequests: Number(pendingRes.rows[0]?.n) || 0,
    });
  } catch (e: any) {
    console.error("[FoundersAgencies] kpis error:", e?.message);
    res.status(500).json(genericError("Failed to load agency KPIs"));
  }
});

// ─── Tree ────────────────────────────────────────────────────────────────────

router.get("/agencies/tree", async (_req, res) => {
  try {
    const agencyRes = await pool.query(
      `WITH RECURSIVE agency_tree AS (
         SELECT id, parent_agency_id, name, dba_name, status, state_of_formation,
                ein, contact_email, formation_date, 0 AS depth
           FROM agencies
          WHERE parent_agency_id IS NULL
         UNION ALL
         SELECT a.id, a.parent_agency_id, a.name, a.dba_name, a.status,
                a.state_of_formation, a.ein, a.contact_email, a.formation_date,
                t.depth + 1
           FROM agencies a
           JOIN agency_tree t ON t.id = a.parent_agency_id
          WHERE t.depth < 50
       )
       SELECT id::text AS id, parent_agency_id::text AS parent_agency_id,
              name, dba_name, status, state_of_formation, ein, contact_email,
              formation_date, depth
         FROM agency_tree
         ORDER BY depth ASC, name ASC`,
    );

    const teamsRes = await pool.query(
      `SELECT at.agency_id::text AS agency_id,
              at.manager_user_id::text AS manager_user_id,
              u.first_name, u.last_name, u.email,
              at.assigned_at
         FROM agency_teams at
         JOIN users u ON u.id = at.manager_user_id
         ORDER BY u.last_name ASC NULLS LAST`,
    );

    // Index teams by agency_id. Field names mirror the snake_case shape
    // FoundersAgencyManagement.tsx + AgencyTreeFlow.tsx consume so the page
    // doesn't have to maintain two parallel field-naming conventions.
    const teamsByAgency: Record<string, any[]> = {};
    for (const t of teamsRes.rows) {
      const aid = t.agency_id;
      if (!teamsByAgency[aid]) teamsByAgency[aid] = [];
      const fullName = `${t.first_name || ""} ${t.last_name || ""}`.trim();
      teamsByAgency[aid].push({
        manager_user_id: t.manager_user_id,
        manager_name: fullName || t.email || null,
        first_name: t.first_name,
        last_name: t.last_name,
        email: t.email,
        assigned_at: t.assigned_at,
      });
    }

    // Build node map then attach children to parents.
    type Node = {
      id: string;
      parent_agency_id: string | null;
      name: string;
      dba_name: string | null;
      status: string;
      state_of_formation: string | null;
      ein: string | null;
      contact_email: string | null;
      formation_date: string | null;
      teams: any[];
      children: Node[];
    };
    const nodes: Record<string, Node> = {};
    for (const r of agencyRes.rows) {
      nodes[r.id] = {
        id: r.id,
        parent_agency_id: r.parent_agency_id,
        name: r.name,
        dba_name: r.dba_name,
        status: r.status,
        state_of_formation: r.state_of_formation,
        ein: maskEin(r.ein),
        contact_email: r.contact_email,
        formation_date: r.formation_date,
        teams: teamsByAgency[r.id] || [],
        children: [],
      };
    }
    const roots: Node[] = [];
    for (const node of Object.values(nodes)) {
      if (node.parent_agency_id && nodes[node.parent_agency_id]) {
        nodes[node.parent_agency_id].children.push(node);
      } else {
        roots.push(node);
      }
    }
    // FE expects a single root agency object (not an array). The seed/migration
    // backfill enforces exactly one parent_agency_id IS NULL row, so pick it.
    // Fall back to null if no roots — the AgencyTreeFlow renders an empty-state.
    res.json(roots[0] ?? null);
  } catch (e: any) {
    console.error("[FoundersAgencies] tree error:", e?.message);
    res.status(500).json(genericError("Failed to load agency tree"));
  }
});

// ─── Entity stats / roster ───────────────────────────────────────────────────

router.get("/agencies/entity-stats", async (_req, res) => {
  try {
    const totalRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM agent_profiles`,
    );
    const formedRes = await pool.query(
      `SELECT company_type, COUNT(*)::int AS n
         FROM agent_profiles
        WHERE dba_type = 'business_entity'
          AND company_type IS NOT NULL
        GROUP BY company_type
        ORDER BY n DESC`,
    );
    const total = Number(totalRes.rows[0]?.n) || 0;
    const byType: Record<string, number> = {};
    let formed = 0;
    for (const r of formedRes.rows) {
      const t = r.company_type as string;
      byType[t] = Number(r.n) || 0;
      formed += byType[t];
    }
    res.json({
      totalAgents: total,
      formedEntities: formed,
      soleProprietors: Math.max(0, total - formed),
      byCompanyType: byType,
    });
  } catch (e: any) {
    console.error("[FoundersAgencies] entity-stats error:", e?.message);
    res.status(500).json(genericError("Failed to load entity stats"));
  }
});

router.get("/agencies/entity-roster", async (req, res) => {
  try {
    // Schema reality: `users.id` is uuid, but `agent_profiles.user_id` is
    // character varying (legacy column). All comparisons must be cast to text
    // to avoid the "operator does not exist: uuid = character varying" error
    // that 500s the Founders Agency Management → Entities tab.
    const r = await pool.query(
      `SELECT u.id::text AS user_id,
              u.first_name, u.last_name, u.email,
              ap.dba_type, ap.company_type, ap.dba_name, ap.state_of_inc,
              ap.ein, ap.articles_s3_key, ap.owners_json,
              a.name AS agency_name
         FROM agent_profiles ap
         JOIN users u ON u.id::text = ap.user_id::text
    LEFT JOIN agent_hierarchy ah
           ON ah.agent_user_id::text = u.id::text
          AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
    LEFT JOIN agency_teams at
           ON at.manager_user_id::text = u.id::text
           OR at.manager_user_id::text = ah.direct_upline_id::text
    LEFT JOIN agencies a ON a.id = at.agency_id
        ORDER BY u.last_name ASC NULLS LAST, u.first_name ASC NULLS LAST
        LIMIT 500`,
    );

    const rows = r.rows.map((p: any) => {
      let ownerCount = 0;
      if (p.owners_json) {
        try {
          const parsed = typeof p.owners_json === "string"
            ? JSON.parse(p.owners_json)
            : p.owners_json;
          if (Array.isArray(parsed)) ownerCount = parsed.length;
        } catch {
          /* swallow */
        }
      }
      return {
        id: p.user_id,
        agentName: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        email: p.email,
        agencyName: p.agency_name || "Gold Coast Financial Partners LLC",
        dbaType: p.dba_type || null,
        companyType: p.company_type || null,
        dbaName: p.dba_name || null,
        stateOfInc: p.state_of_inc || null,
        einMasked: maskEin(p.ein),
        articlesUploaded: !!p.articles_s3_key,
        ownerCount,
      };
    });
    res.json(rows);
  } catch (e: any) {
    console.error("[FoundersAgencies] entity-roster error:", e?.message);
    res.status(500).json(genericError("Failed to load entity roster"));
  }
});

// ─── LLC formation guide (state-by-state) ────────────────────────────────────

interface StateGuide {
  filingFee: number; // dollars
  sosUrl: string;
  eta: string;
}

const FORMATION_GUIDE: Record<string, StateGuide> = {
  AL: { filingFee: 200, sosUrl: "https://sos.alabama.gov/business-services", eta: "5-10 business days" },
  AK: { filingFee: 250, sosUrl: "https://www.commerce.alaska.gov/cbp/main/", eta: "5-10 business days" },
  AZ: { filingFee: 50,  sosUrl: "https://ecorp.azcc.gov/", eta: "5-10 business days" },
  AR: { filingFee: 45,  sosUrl: "https://www.sos.arkansas.gov/business-commercial-services-bcs", eta: "5-10 business days" },
  CA: { filingFee: 70,  sosUrl: "https://bizfileonline.sos.ca.gov/", eta: "5-10 business days" },
  CO: { filingFee: 50,  sosUrl: "https://www.sos.state.co.us/biz/", eta: "5-10 business days" },
  CT: { filingFee: 120, sosUrl: "https://service.ct.gov/business/", eta: "5-10 business days" },
  DE: { filingFee: 90,  sosUrl: "https://corp.delaware.gov/", eta: "5-10 business days" },
  DC: { filingFee: 99,  sosUrl: "https://corponline.dcra.dc.gov/", eta: "5-10 business days" },
  FL: { filingFee: 125, sosUrl: "https://dos.myflorida.com/sunbiz/", eta: "5-10 business days" },
  GA: { filingFee: 100, sosUrl: "https://ecorp.sos.ga.gov/", eta: "5-10 business days" },
  HI: { filingFee: 50,  sosUrl: "https://hbe.ehawaii.gov/", eta: "5-10 business days" },
  ID: { filingFee: 100, sosUrl: "https://sos.idaho.gov/business-services/", eta: "5-10 business days" },
  IL: { filingFee: 150, sosUrl: "https://www.ilsos.gov/businessservices/", eta: "5-10 business days" },
  IN: { filingFee: 95,  sosUrl: "https://inbiz.in.gov/", eta: "5-10 business days" },
  IA: { filingFee: 50,  sosUrl: "https://sos.iowa.gov/business/", eta: "5-10 business days" },
  KS: { filingFee: 160, sosUrl: "https://www.sos.ks.gov/business/business.html", eta: "5-10 business days" },
  KY: { filingFee: 40,  sosUrl: "https://onestop.ky.gov/", eta: "5-10 business days" },
  LA: { filingFee: 100, sosUrl: "https://coraweb.sos.la.gov/", eta: "5-10 business days" },
  ME: { filingFee: 175, sosUrl: "https://www.maine.gov/sos/cec/corp/", eta: "5-10 business days" },
  MD: { filingFee: 100, sosUrl: "https://egov.maryland.gov/businessexpress", eta: "5-10 business days" },
  MA: { filingFee: 500, sosUrl: "https://corp.sec.state.ma.us/", eta: "5-10 business days" },
  MI: { filingFee: 50,  sosUrl: "https://cofs.lara.state.mi.us/", eta: "5-10 business days" },
  MN: { filingFee: 155, sosUrl: "https://mblsportal.sos.state.mn.us/", eta: "5-10 business days" },
  MS: { filingFee: 50,  sosUrl: "https://www.sos.ms.gov/business-services", eta: "5-10 business days" },
  MO: { filingFee: 50,  sosUrl: "https://bsd.sos.mo.gov/", eta: "5-10 business days" },
  MT: { filingFee: 35,  sosUrl: "https://biz.sosmt.gov/", eta: "5-10 business days" },
  NE: { filingFee: 100, sosUrl: "https://sos.nebraska.gov/business-services", eta: "5-10 business days" },
  NV: { filingFee: 425, sosUrl: "https://www.nvsilverflume.gov/", eta: "5-10 business days" },
  NH: { filingFee: 100, sosUrl: "https://quickstart.sos.nh.gov/", eta: "5-10 business days" },
  NJ: { filingFee: 125, sosUrl: "https://www.njportal.com/DOR/BusinessFormation/", eta: "5-10 business days" },
  NM: { filingFee: 50,  sosUrl: "https://portal.sos.state.nm.us/", eta: "5-10 business days" },
  NY: { filingFee: 200, sosUrl: "https://www.dos.ny.gov/corps/", eta: "5-10 business days" },
  NC: { filingFee: 125, sosUrl: "https://www.sosnc.gov/online_services/business", eta: "5-10 business days" },
  ND: { filingFee: 135, sosUrl: "https://firststop.sos.nd.gov/", eta: "5-10 business days" },
  OH: { filingFee: 99,  sosUrl: "https://www.ohiosos.gov/businesses/", eta: "5-10 business days" },
  OK: { filingFee: 100, sosUrl: "https://www.sos.ok.gov/business/", eta: "5-10 business days" },
  OR: { filingFee: 100, sosUrl: "https://sos.oregon.gov/business/", eta: "5-10 business days" },
  PA: { filingFee: 125, sosUrl: "https://www.dos.pa.gov/BusinessCharities/Business/", eta: "5-10 business days" },
  RI: { filingFee: 150, sosUrl: "https://business.sos.ri.gov/", eta: "5-10 business days" },
  SC: { filingFee: 110, sosUrl: "https://businessfilings.sc.gov/", eta: "5-10 business days" },
  SD: { filingFee: 150, sosUrl: "https://sosenterprise.sd.gov/", eta: "5-10 business days" },
  TN: { filingFee: 300, sosUrl: "https://tnbear.tn.gov/", eta: "5-10 business days" },
  TX: { filingFee: 300, sosUrl: "https://www.sos.state.tx.us/corp/", eta: "5-10 business days" },
  UT: { filingFee: 70,  sosUrl: "https://corporations.utah.gov/", eta: "5-10 business days" },
  VT: { filingFee: 125, sosUrl: "https://sos.vermont.gov/corporations/", eta: "5-10 business days" },
  VA: { filingFee: 100, sosUrl: "https://cis.scc.virginia.gov/", eta: "5-10 business days" },
  WA: { filingFee: 200, sosUrl: "https://ccfs.sos.wa.gov/", eta: "5-10 business days" },
  WV: { filingFee: 100, sosUrl: "https://business4.wv.gov/", eta: "5-10 business days" },
  WI: { filingFee: 130, sosUrl: "https://www.wdfi.org/corporations/", eta: "5-10 business days" },
  WY: { filingFee: 100, sosUrl: "https://wyobiz.wyo.gov/", eta: "5-10 business days" },
};

router.get("/agencies/formation-guide", (req, res) => {
  const stateRaw = String(req.query.state || "").toUpperCase();
  if (!stateRaw) {
    // Return the full map keyed by state code so the FE can render its own
    // selector-driven UI without round-tripping per state.
    return res.json(FORMATION_GUIDE);
  }
  if (!/^[A-Z]{2}$/.test(stateRaw)) {
    return res.status(400).json({ error: "Invalid state code" });
  }
  const guide = FORMATION_GUIDE[stateRaw];
  if (!guide) {
    return res.status(404).json({ error: "No guide for this state" });
  }
  return res.json({ state: stateRaw, ...guide });
});

// ─── Send formation guide (email + in-app notification) ─────────────────────

// Canonical 51-entry state-name map used to validate inputs and build readable
// subjects/headers. Mirrors STATES_LIST in client/src/lib/data/llcStateGuide.ts.
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// Universal 8-step checklist — mirrors UNIVERSAL_LLC_CHECKLIST in
// client/src/lib/data/llcStateGuide.ts. Server-side duplication keeps the
// email template self-contained without crossing the client/server boundary.
const UNIVERSAL_LLC_CHECKLIST: FormationChecklistItem[] = [
  { number: 1, title: "Pick a unique business name", description: "Search the state SOS business name database to confirm availability. Name must include 'LLC' or 'Limited Liability Company'." },
  { number: 2, title: "Designate a registered agent", description: "Must be a person or entity with a physical address in the state of formation, available during business hours." },
  { number: 3, title: "File Articles of Organization", description: "Submit through the state SOS portal. See state-specific link above for filing fee and estimated turnaround." },
  { number: 4, title: "Apply for an EIN", description: "Free, takes ~10 minutes online. The EIN replaces your SSN on tax filings and bank applications.", externalUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
  { number: 5, title: "Draft an operating agreement", description: "Even single-member LLCs benefit from one — clarifies ownership, profit splits, and dissolution terms." },
  { number: 6, title: "Open a business bank account", description: "Required to maintain the corporate veil. Most banks need EIN, articles, and operating agreement." },
  { number: 7, title: "Designate a DRLP (Designated Responsible Licensed Producer)", description: "If you're a licensed insurance producer: designate a Designated Responsible Licensed Producer (DRLP) per your carrier's requirements." },
  { number: 8, title: "Upload articles + EIN to your DBA profile", description: "Once formed, complete /agent/dba so your agency can request carrier appointments under the new entity." },
];

// Per-state notes keyed by state code — surfaces the same "heads up" copy that
// the frontend renders inside its filing card. Pulled from the canonical
// hardcoded guide; kept narrow because the bulk of state data already comes
// from FORMATION_GUIDE above.
const STATE_NOTES: Record<string, string> = {
  AL: "$200 filing fee plus county probate fee (typically $50).",
  AK: "Biennial report required ($100).",
  CA: "$800 annual minimum franchise tax kicks in year 2.",
  DE: "$300 annual franchise tax. Popular for holding companies.",
  FL: "Annual report $138.75 (due May 1).",
  IL: "Annual report $75.",
  MA: "Annual report $500. One of the highest-cost states.",
  NV: "$200 business license + $150 list of managers due annually. Total year-1 ~$425.",
  NY: "Newspaper publication required (~$200-$2,000 depending on county). Biennial statement $9.",
  TN: "Filing fee scales with member count.",
  TX: "No annual report. Franchise tax may apply above revenue threshold.",
  WY: "Annual report min $60. Strong privacy protections.",
};

// RFC-5322 simplified — same validator the client-side modal uses, mirrored
// here so server-side validation stays authoritative.
const EMAIL_RE =
  /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

const SendFormationGuideSchema = z
  .object({
    state: z
      .string()
      .length(2)
      .regex(/^[A-Za-z]{2}$/, "State must be a 2-letter code")
      .transform((s) => s.toUpperCase()),
    recipientUserIds: z
      .array(z.string().regex(UUID_RE, "Invalid user id"))
      .max(50, "Too many recipients")
      .default([]),
    recipientEmails: z
      .array(z.string().regex(EMAIL_RE, "Invalid email"))
      .max(50, "Too many recipients")
      .default([]),
    channels: z.object({
      email: z.boolean(),
      notification: z.boolean(),
    }),
    introNote: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      const total =
        (data.recipientUserIds?.length ?? 0) +
        (data.recipientEmails?.length ?? 0);
      return total > 0 && total <= 50;
    },
    { message: "Total recipients (user IDs + emails) must be 1–50" },
  );

router.post("/agencies/formation-guide/send", formationGuideSendLimiter, blockWritesDuringViewAs, async (req, res) => {
  // Validate body
  const parse = SendFormationGuideSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parse.error.flatten(),
    });
  }
  const { state, recipientUserIds, recipientEmails, channels, introNote } =
    parse.data;

  // At least one channel selected
  if (!channels.email && !channels.notification) {
    return res
      .status(400)
      .json({ error: "Pick at least one channel (email or notification)." });
  }

  // At least one recipient
  if (recipientUserIds.length === 0 && recipientEmails.length === 0) {
    return res.status(400).json({ error: "Pick at least one recipient." });
  }

  // Reject "notification only + free-text emails" — non-users cannot receive
  // an in-app notification.
  if (
    !channels.email &&
    channels.notification &&
    recipientEmails.length > 0 &&
    recipientUserIds.length === 0
  ) {
    return res.status(400).json({
      error:
        "Free-text emails can only receive email — pick the email channel or remove them.",
      code: "EMAIL_ONLY_FOR_NON_USERS",
    });
  }

  // Validate state
  const stateName = STATE_NAMES[state];
  if (!stateName) {
    return res.status(400).json({ error: "Unknown state code" });
  }
  const stateGuide = FORMATION_GUIDE[state];
  if (!stateGuide) {
    return res.status(404).json({ error: "No guide for this state" });
  }

  const guide: FormationGuideStateData = {
    state,
    stateName,
    filingFee: stateGuide.filingFee,
    sosUrl: stateGuide.sosUrl,
    eta: stateGuide.eta,
    notes: STATE_NOTES[state] || null,
  };

  // Sender display name — used as the email closing signature.
  const senderName =
    [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") ||
    req.user?.email ||
    null;

  // Portal URL for the deep-link CTA in the email body. Falls back to the
  // request origin when no PUBLIC_URL is set so dev environments still work.
  const portalUrl =
    process.env.PUBLIC_URL ||
    process.env.APP_URL ||
    `${req.protocol}://${req.get("host")}`;

  // ─── Resolve hierarchy-picked recipients to {email, name} ─────────────
  type ResolvedUser = {
    userId: string;
    email: string | null;
    name: string;
  };
  const resolvedUsers: ResolvedUser[] = [];
  if (recipientUserIds.length > 0) {
    const r = await pool.query(
      `SELECT id::text AS id, email, first_name, last_name
         FROM users
        WHERE id = ANY($1::uuid[])
          AND is_active = true`,
      [recipientUserIds],
    );
    for (const row of r.rows) {
      resolvedUsers.push({
        userId: row.id,
        email: row.email || null,
        name: [row.first_name, row.last_name].filter(Boolean).join(" ") || (row.email || "there"),
      });
    }
  }

  // ─── Send loop ────────────────────────────────────────────────────────
  let emailsSent = 0;
  let notificationsSent = 0;
  const errors: Array<{
    target: string;
    channel: "email" | "notification";
    message: string;
  }> = [];

  // Per-user: in-app notification + (optional) email
  for (const user of resolvedUsers) {
    if (channels.notification) {
      try {
        await storage.createNotification({
          userId: user.userId,
          title: `LLC Formation Guide — ${stateName}`,
          message: `Your administrator sent you the ${stateName} (${state}) LLC formation guide. Filing fee: ${
            guide.filingFee !== null ? `$${guide.filingFee}` : guide.feeNote || "Varies"
          } · ETA: ${guide.eta}. Check your email for the full guide.`,
          type: "formation_guide_sent",
          isRead: false,
          actionUrl: `/founders/agency-management?tab=formation-guide&state=${state}`,
        });
        notificationsSent++;
      } catch (err: any) {
        console.error(
          "[FormationGuide] notification failed for user",
          user.userId,
          err?.message,
        );
        errors.push({
          target: user.userId,
          channel: "notification",
          message: err?.message || "Notification insert failed",
        });
      }
    }

    if (channels.email) {
      if (!user.email) {
        errors.push({
          target: user.userId,
          channel: "email",
          message: "User has no email on file",
        });
        continue;
      }
      try {
        await sendFormationGuideEmail({
          toEmail: user.email,
          toName: user.name,
          guide,
          checklist: UNIVERSAL_LLC_CHECKLIST,
          introNote: introNote || null,
          portalUrl,
          senderName,
        });
        emailsSent++;
      } catch (err: any) {
        console.error(
          "[FormationGuide] email failed for user",
          user.userId,
          err?.message,
        );
        errors.push({
          target: user.email,
          channel: "email",
          message: err?.message || "Email send failed",
        });
      }
    }
  }

  // Free-text email recipients: email-only (no in-app notification path).
  if (channels.email) {
    for (const email of recipientEmails) {
      try {
        await sendFormationGuideEmail({
          toEmail: email,
          toName: null,
          guide,
          checklist: UNIVERSAL_LLC_CHECKLIST,
          introNote: introNote || null,
          portalUrl,
          senderName,
        });
        emailsSent++;
      } catch (err: any) {
        console.error(
          "[FormationGuide] email failed for free-text",
          email,
          err?.message,
        );
        errors.push({
          target: email,
          channel: "email",
          message: err?.message || "Email send failed",
        });
      }
    }
  }

  // ─── Audit ───────────────────────────────────────────────────────────
  await logFounderAction({
    actorUserId: req.user!.id,
    action: "formation_guide_sent",
    entityType: "formation_guide",
    entityId: `${state}_${Date.now()}`,
    payload: {
      state,
      stateName,
      recipientUserIds,
      recipientEmails,
      channels,
      introNote: introNote || null,
      emailsSent,
      notificationsSent,
      errorCount: errors.length,
    },
    viewingAs: viewingAsOf(req),
  });

  res.json({
    success: true,
    emailsSent,
    notificationsSent,
    errors,
  });
});

// Preview endpoint — returns the rendered HTML so the modal can show a
// founder-curated preview before pressing Send. Does not write anything.
//
// Wave 4 hardening: every step is wrapped in a try/catch so any underlying
// failure (Zod refinement crash, malformed state data, render exception,
// etc.) surfaces a real error message in the JSON response — not the opaque
// "The string did not match the expected pattern" DOMException that bubbles
// up when the server returns HTML and the client tries to res.json() it.
router.post("/agencies/formation-guide/preview", formationGuidePreviewLimiter, (req, res) => {
  try {
    const previewSchema = z.object({
      state: z
        .string()
        .length(2)
        .regex(/^[A-Za-z]{2}$/)
        .transform((s) => s.toUpperCase()),
      introNote: z.string().max(2000).optional().nullable(),
    });
    const parse = previewSchema.safeParse(req.body);
    if (!parse.success) {
      console.error(
        "[FormationGuide preview] invalid request body:",
        parse.error.flatten(),
        "body=",
        req.body,
      );
      return res.status(400).json({
        error: "Invalid preview request",
        details: parse.error.flatten(),
      });
    }
    const { state, introNote } = parse.data;
    const stateName = STATE_NAMES[state];
    const stateGuide = FORMATION_GUIDE[state];
    if (!stateName || !stateGuide) {
      return res
        .status(404)
        .json({ error: `No formation guide configured for state '${state}'.` });
    }
    const guide: FormationGuideStateData = {
      state,
      stateName,
      filingFee: stateGuide.filingFee,
      sosUrl: stateGuide.sosUrl,
      eta: stateGuide.eta,
      notes: STATE_NOTES[state] || null,
    };
    const senderName =
      [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") ||
      req.user?.email ||
      null;
    const portalUrl =
      process.env.PUBLIC_URL ||
      process.env.APP_URL ||
      `${req.protocol}://${req.get("host")}`;
    const html = renderFormationGuideHtml({
      toEmail: "preview@example.com",
      toName: "Recipient",
      guide,
      checklist: UNIVERSAL_LLC_CHECKLIST,
      introNote: introNote || null,
      portalUrl,
      senderName,
    });
    return res.json({ html });
  } catch (err: any) {
    // Surface the real exception so the modal stops swallowing it as the
    // generic "did not match expected pattern" WebKit DOMException that fires
    // when fetch + res.json() collide with an HTML 500 default error page.
    console.error("[FormationGuide preview] render failed:", err?.message, err?.stack);
    return res.status(500).json({
      error: `Preview render failed: ${err?.message || "Unknown error"}`,
    });
  }
});

// ─── Single agency detail ────────────────────────────────────────────────────

router.get("/agencies/:id", async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: "Invalid agency id" });
  try {
    const agencyRes = await pool.query(
      `SELECT id::text AS id, parent_agency_id::text AS parent_agency_id,
              name, dba_name, legal_entity_type, ein, state_of_formation,
              formation_date, primary_contact_user_id::text AS primary_contact_user_id,
              contact_email, contact_phone, street_address, city, state, zip_code,
              status, notes, created_at, updated_at
         FROM agencies WHERE id = $1::uuid`,
      [req.params.id],
    );
    if (agencyRes.rows.length === 0) {
      return res.status(404).json({ error: "Agency not found" });
    }
    const a = agencyRes.rows[0];
    const teamsRes = await pool.query(
      `SELECT at.manager_user_id::text AS manager_user_id,
              u.first_name, u.last_name, u.email, at.assigned_at
         FROM agency_teams at
         JOIN users u ON u.id = at.manager_user_id
        WHERE at.agency_id = $1::uuid
        ORDER BY u.last_name ASC NULLS LAST`,
      [req.params.id],
    );
    res.json({
      ...a,
      ein: maskEin(a.ein),
      // Keep snake_case to match the rest of the agency_detail consumer
      // (AgencyDetailCard reads t.manager_user_id and t.manager_name).
      teams: teamsRes.rows.map((t: any) => {
        const fullName = `${t.first_name || ""} ${t.last_name || ""}`.trim();
        return {
          manager_user_id: t.manager_user_id,
          manager_name: fullName || t.email || null,
          first_name: t.first_name,
          last_name: t.last_name,
          email: t.email,
          assigned_at: t.assigned_at,
        };
      }),
    });
  } catch (e: any) {
    console.error("[FoundersAgencies] get agency error:", e?.message);
    res.status(500).json(genericError("Failed to load agency"));
  }
});

// ─── Create agency ───────────────────────────────────────────────────────────

router.post("/agencies", blockWritesDuringViewAs, async (req, res) => {
  try {
    const {
      parentAgencyId,
      name,
      dbaName,
      legalEntityType,
      ein,
      stateOfFormation,
      formationDate,
      primaryContactUserId,
      contactEmail,
      contactPhone,
      streetAddress,
      city,
      state,
      zipCode,
      notes,
    } = req.body || {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Agency name is required" });
    }
    if (name.length > 255) {
      return res.status(400).json({ error: "Agency name too long" });
    }
    if (parentAgencyId !== undefined && parentAgencyId !== null && !isUuid(parentAgencyId)) {
      return res.status(400).json({ error: "Invalid parentAgencyId" });
    }
    if (primaryContactUserId !== undefined && primaryContactUserId !== null && !isUuid(primaryContactUserId)) {
      return res.status(400).json({ error: "Invalid primaryContactUserId" });
    }

    // Cycle prevention: confirm the parent exists. Cycle BFS only matters when
    // we're inserting under an existing parent — a brand-new id can't be in
    // anyone's descendant set.
    if (parentAgencyId) {
      const parentRes = await pool.query(
        `SELECT id FROM agencies WHERE id = $1::uuid LIMIT 1`,
        [parentAgencyId],
      );
      if (parentRes.rows.length === 0) {
        return res.status(400).json({ error: "Parent agency not found" });
      }
    }

    const insertRes = await pool.query(
      `INSERT INTO agencies (
         parent_agency_id, name, dba_name, legal_entity_type, ein,
         state_of_formation, formation_date, primary_contact_user_id,
         contact_email, contact_phone, street_address, city, state, zip_code,
         status, notes, created_by_user_id
       ) VALUES (
         $1::uuid, $2, $3, $4, $5, $6, $7::date, $8::uuid,
         $9, $10, $11, $12, $13, $14, 'active', $15, $16::uuid
       ) RETURNING id::text AS id`,
      [
        parentAgencyId || null,
        name.trim(),
        dbaName || null,
        legalEntityType || null,
        ein || null,
        stateOfFormation || null,
        formationDate || null,
        primaryContactUserId || null,
        contactEmail || null,
        contactPhone || null,
        streetAddress || null,
        city || null,
        state || null,
        zipCode || null,
        notes || null,
        req.user!.id,
      ],
    );
    const newId = insertRes.rows[0].id;

    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_created",
      entityType: "agency",
      entityId: newId,
      payload: { name, parentAgencyId: parentAgencyId || null, stateOfFormation },
      viewingAs: viewingAsOf(req),
    });

    res.json({ success: true, id: newId });
  } catch (e: any) {
    console.error("[FoundersAgencies] create agency error:", e?.message);
    res.status(500).json(genericError("Failed to create agency"));
  }
});

// ─── Update agency ───────────────────────────────────────────────────────────

router.patch("/agencies/:id", blockWritesDuringViewAs, async (req, res) => {
  const id = req.params.id;
  if (!isUuid(id)) return res.status(400).json({ error: "Invalid agency id" });
  try {
    const allowed: Record<string, string> = {
      parentAgencyId: "parent_agency_id",
      name: "name",
      dbaName: "dba_name",
      legalEntityType: "legal_entity_type",
      ein: "ein",
      stateOfFormation: "state_of_formation",
      formationDate: "formation_date",
      primaryContactUserId: "primary_contact_user_id",
      contactEmail: "contact_email",
      contactPhone: "contact_phone",
      streetAddress: "street_address",
      city: "city",
      state: "state",
      zipCode: "zip_code",
      status: "status",
      notes: "notes",
    };

    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const [key, col] of Object.entries(allowed)) {
      if (!(key in (req.body || {}))) continue;
      const v = req.body[key];
      if (key === "parentAgencyId") {
        if (v !== null && !isUuid(v)) {
          return res.status(400).json({ error: "Invalid parentAgencyId" });
        }
        if (v && (await wouldCreateCycle(id, v))) {
          return res.status(400).json({
            error: "Would create cycle in agency tree",
            code: "AGENCY_CYCLE",
          });
        }
        sets.push(`${col} = $${idx++}::uuid`);
        vals.push(v);
        continue;
      }
      if (key === "status" && v !== null && !VALID_AGENCY_STATUS.has(v)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      if (key === "primaryContactUserId" && v !== null && !isUuid(v)) {
        return res.status(400).json({ error: "Invalid primaryContactUserId" });
      }
      if (key === "primaryContactUserId") {
        sets.push(`${col} = $${idx++}::uuid`);
        vals.push(v);
        continue;
      }
      if (key === "formationDate") {
        sets.push(`${col} = $${idx++}::date`);
        vals.push(v || null);
        continue;
      }
      sets.push(`${col} = $${idx++}`);
      vals.push(v ?? null);
    }
    if (sets.length === 0) {
      return res.status(400).json({ error: "No editable fields supplied" });
    }
    sets.push(`updated_at = NOW()`);
    vals.push(id);

    const upd = await pool.query(
      `UPDATE agencies SET ${sets.join(", ")} WHERE id = $${idx}::uuid RETURNING id::text AS id`,
      vals,
    );
    if (upd.rowCount === 0) {
      return res.status(404).json({ error: "Agency not found" });
    }

    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_updated",
      entityType: "agency",
      entityId: id,
      payload: { fields: Object.keys(req.body || {}) },
      viewingAs: viewingAsOf(req),
    });

    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] patch agency error:", e?.message);
    res.status(500).json(genericError("Failed to update agency"));
  }
});

// ─── Delete (soft-suspend or hard-delete) agency ─────────────────────────────

router.delete("/agencies/:id", blockWritesDuringViewAs, async (req, res) => {
  const id = req.params.id;
  if (!isUuid(id)) return res.status(400).json({ error: "Invalid agency id" });
  if (id === ROOT_AGENCY_ID) {
    return res.status(400).json({ error: "Cannot delete the root agency" });
  }
  try {
    const teamsRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM agency_teams WHERE agency_id = $1::uuid`,
      [id],
    );
    const contractsRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM agency_carrier_contracts WHERE agency_id = $1::uuid`,
      [id],
    );
    const teamCount = Number(teamsRes.rows[0]?.n) || 0;
    const contractCount = Number(contractsRes.rows[0]?.n) || 0;

    if (teamCount === 0 && contractCount === 0) {
      const del = await pool.query(
        `DELETE FROM agencies WHERE id = $1::uuid RETURNING id::text AS id`,
        [id],
      );
      if (del.rowCount === 0) {
        return res.status(404).json({ error: "Agency not found" });
      }
      await logFounderAction({
        actorUserId: req.user!.id,
        action: "agency_deleted",
        entityType: "agency",
        entityId: id,
        payload: { mode: "hard" },
        viewingAs: viewingAsOf(req),
      });
      return res.json({ success: true, mode: "hard" });
    }

    // Soft suspend.
    const upd = await pool.query(
      `UPDATE agencies SET status = 'suspended', updated_at = NOW()
        WHERE id = $1::uuid RETURNING id::text AS id`,
      [id],
    );
    if (upd.rowCount === 0) {
      return res.status(404).json({ error: "Agency not found" });
    }
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_suspended",
      entityType: "agency",
      entityId: id,
      payload: { mode: "soft", teamCount, contractCount },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true, mode: "soft" });
  } catch (e: any) {
    console.error("[FoundersAgencies] delete agency error:", e?.message);
    res.status(500).json(genericError("Failed to delete agency"));
  }
});

// ─── Assign team (manager) to agency (upsert via PK on manager_user_id) ─────

router.post("/agencies/:id/teams", blockWritesDuringViewAs, async (req, res) => {
  const agencyId = req.params.id;
  if (!isUuid(agencyId)) return res.status(400).json({ error: "Invalid agency id" });
  const { managerUserId } = req.body || {};
  if (!isUuid(managerUserId)) {
    return res.status(400).json({ error: "managerUserId required" });
  }
  try {
    // Confirm agency exists.
    const a = await pool.query(`SELECT id FROM agencies WHERE id = $1::uuid LIMIT 1`, [agencyId]);
    if (a.rows.length === 0) {
      return res.status(404).json({ error: "Agency not found" });
    }
    // Confirm manager exists.
    const u = await pool.query(`SELECT id FROM users WHERE id = $1::uuid LIMIT 1`, [managerUserId]);
    if (u.rows.length === 0) {
      return res.status(404).json({ error: "Manager not found" });
    }

    // PK is on manager_user_id, so this UPSERT moves the team if it was
    // already assigned elsewhere.
    await pool.query(
      `INSERT INTO agency_teams (agency_id, manager_user_id, assigned_at, assigned_by_user_id)
       VALUES ($1::uuid, $2::uuid, NOW(), $3::uuid)
       ON CONFLICT (manager_user_id)
       DO UPDATE SET agency_id = EXCLUDED.agency_id,
                     assigned_at = NOW(),
                     assigned_by_user_id = EXCLUDED.assigned_by_user_id`,
      [agencyId, managerUserId, req.user!.id],
    );

    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_team_assigned",
      entityType: "agency_team",
      entityId: managerUserId,
      payload: { agencyId, managerUserId },
      viewingAs: viewingAsOf(req),
    });

    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] assign team error:", e?.message);
    res.status(500).json(genericError("Failed to assign team"));
  }
});

// ─── Promote-and-Assign (atomic Quick Name flow) ─────────────────────────────
//
// Atomic combo of three actions for the Quick Name UX (plan: Phase 2,
// ~/.claude/plans/ok-lets-now-design-async-cosmos.md):
//   1. (Optional) Promote the agent to "Team Lead" if their current
//      hierarchy_title is below it (lower-tier IC titles).
//   2. Insert a lightweight agency (name only — LLC fields stay null).
//   3. Assign the agent as the manager of that agency (UPSERT — moves them if
//      they were already managing a different agency).
//
// All three steps run inside a single BEGIN/COMMIT — mirrors the forward-only
// hierarchy mutation pattern in `server/routes/hcms-hierarchy.ts:130+` PATCH
// handler. Audit log emission happens AFTER commit so a rolled-back transaction
// never leaves a phantom audit row.
//
// Title taxonomy comes from `shared/models/enterprise.ts` HIERARCHY_TITLES
// (the single source of truth used by hcms-hierarchy.ts as well). Titles below
// "Team Lead" trigger the auto-promotion path; "Team Lead" and above pass
// through unchanged.
//
// Tier classification (from HIERARCHY_TITLES level keys 0-7):
//   - Lower tier (needs promotion):  Senior Agent, Agent, Associate Agent
//   - Manager tier (no promotion):   Team Lead, Regional Manager,
//                                    Platinum Director, Diamond Director,
//                                    Founder
// Founder/Owner are explicitly refused (a founder shouldn't be quick-named
// onto a sub-agency).

const TEAM_LEAD_TITLE = "Team Lead";
// Lower-tier titles that trigger auto-promotion. Derived from HIERARCHY_TITLES
// (levels 5/6/7 in the canonical map) so a rename in shared/models/enterprise
// would surface as a TS error rather than silently mis-classify.
const PROMOTION_REQUIRED_TITLES = new Set<string>([
  HIERARCHY_TITLES[5], // "Senior Agent"
  HIERARCHY_TITLES[6], // "Agent"
  HIERARCHY_TITLES[7], // "Associate Agent"
]);

const promoteAndAssignSchema = z.object({
  agentUserId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  parentAgencyId: z.string().uuid().optional(),
});

router.post("/agencies/promote-and-assign", blockWritesDuringViewAs, async (req, res) => {
  const parsed = promoteAndAssignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      code: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }
  const { agentUserId, name, parentAgencyId } = parsed.data;
  const targetParentId = parentAgencyId ?? ROOT_AGENCY_ID;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Validate agent exists + capture their role for the founder/owner guard.
    const userRes = await client.query(
      `SELECT id::text AS id, role FROM users WHERE id = $1::uuid LIMIT 1`,
      [agentUserId],
    );
    if (userRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Agent not found",
        code: "AGENT_NOT_FOUND",
      });
    }
    const agentRole: string | null = userRes.rows[0].role ?? null;
    if (agentRole === "founder" || agentRole === "owner") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Cannot quick-name a founder or owner",
        code: "INVALID_AGENT",
      });
    }

    // Validate parent agency exists when caller supplied one. (We don't check
    // the implicit ROOT_AGENCY_ID since the seed/migration guarantees it.)
    if (parentAgencyId) {
      const parentRes = await client.query(
        `SELECT id FROM agencies WHERE id = $1::uuid LIMIT 1`,
        [parentAgencyId],
      );
      if (parentRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Parent agency not found",
          code: "INVALID_PARENT_AGENCY",
        });
      }
    }

    // 2. Read the agent's current active hierarchy row.
    const currentRes = await client.query(
      `SELECT * FROM agent_hierarchy
         WHERE agent_user_id = $1::uuid
           AND (effective_to IS NULL OR effective_to > NOW())
         ORDER BY effective_from DESC
         LIMIT 1`,
      [agentUserId],
    );
    const oldRow = currentRes.rows[0] ?? null;
    const oldTitle: string | null = oldRow?.hierarchy_title ?? null;

    // Sentinel MED — defense-in-depth title gate. The earlier `users.role` check
    // above blocks accounts whose role is `founder` / `owner`, but the frontend
    // gates on `hierarchy_title === "Founder" | "Owner"` instead. An attacker
    // could construct a request against a user whose `users.role` is e.g.
    // `system_admin` but whose hierarchy title displays as "Owner". Close that
    // bypass by ALSO refusing the title-tier here, inside the transaction.
    const currentTitle = String(oldTitle ?? "");
    if (currentTitle === "Founder" || currentTitle === "Owner") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Cannot quick-name a founder or owner",
        code: "INVALID_AGENT_TITLE",
      });
    }

    // 3. Determine if promotion is needed. An agent with no active hierarchy
    //    row (rare — usually onboarding hasn't completed) is treated as needing
    //    promotion-by-default to TEAM_LEAD, but we can only execute the soft-end
    //    + insert path when there IS a row to clone, so we just record
    //    needsPromotion=false in that case and let the caller follow up via the
    //    standard PATCH /api/hcms/hierarchy/agents/:id endpoint.
    const needsPromotion =
      !!oldRow &&
      typeof oldTitle === "string" &&
      PROMOTION_REQUIRED_TITLES.has(oldTitle);

    // 4. Forward-only hierarchy mutation — soft-end the old row, insert a new
    //    one with hierarchy_title = "Team Lead". All other columns carry over
    //    unchanged so direct_upline_id, contract_level, override_percentage,
    //    upline_chain stay intact (Ledger spread math is unaffected — we never
    //    raise contract_level here). Also bump `users.role` so the privilege
    //    gate matches the new title (titleToRole("Team Lead") = agency_manager).
    if (needsPromotion && oldRow) {
      await client.query(
        `UPDATE agent_hierarchy SET effective_to = NOW(), updated_at = NOW()
          WHERE id = $1`,
        [oldRow.id],
      );
      await client.query(
        `INSERT INTO agent_hierarchy
           (agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title,
            upline_chain, contract_level, override_eligible, override_percentage,
            effective_from, effective_to, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, NOW(), NULL, NOW(), NOW())`,
        [
          agentUserId,
          oldRow.direct_upline_id,
          oldRow.hierarchy_level,
          TEAM_LEAD_TITLE,
          // upline_chain comes back as a JS array/object from pg's jsonb mapper;
          // re-stringify so the new row stores the same shape.
          JSON.stringify(oldRow.upline_chain ?? []),
          oldRow.contract_level,
          oldRow.override_eligible,
          oldRow.override_percentage,
        ],
      );
      // Mirror the title-derived role on `users.role` AND propagate the
      // matching lounge-access grants via the shared service so heritage-app
      // sees fresh `user_lounge_access` rows + the SOC 2 attestation row in
      // `access_change_log`. The service short-circuits if oldRole === newRole
      // (idempotent), preserving the prior IS DISTINCT FROM behavior.
      const promotedRole = titleToRole(TEAM_LEAD_TITLE);
      await reinitializeLoungeAccess({
        userId: agentUserId,
        newRole: promotedRole,
        performedByUserId: req.user!.id,
        reason: `promote-and-assign → ${TEAM_LEAD_TITLE} for new agency "${name}"`,
        client, // join the existing transaction
      });
    }

    // 5. Insert the lightweight agency (name only).
    const insertAgencyRes = await client.query(
      `INSERT INTO agencies (parent_agency_id, name, status, created_by_user_id)
       VALUES ($1::uuid, $2, 'active', $3::uuid)
       RETURNING id::text AS id, name`,
      [targetParentId, name, req.user!.id],
    );
    const newAgencyId: string = insertAgencyRes.rows[0].id;
    const newAgencyName: string = insertAgencyRes.rows[0].name;

    // 6. Upsert agency_teams assignment. PK is on manager_user_id, so this
    //    moves the manager from any prior agency to the new one.
    await client.query(
      `INSERT INTO agency_teams (agency_id, manager_user_id, assigned_by_user_id)
       VALUES ($1::uuid, $2::uuid, $3::uuid)
       ON CONFLICT (manager_user_id) DO UPDATE SET
         agency_id = EXCLUDED.agency_id,
         assigned_at = NOW(),
         assigned_by_user_id = EXCLUDED.assigned_by_user_id`,
      [newAgencyId, agentUserId, req.user!.id],
    );

    // 7. Commit.
    await client.query("COMMIT");

    // 8. Audit AFTER commit (intentionally outside the transaction — matches
    //    the post-COMMIT emit pattern in hcms-hierarchy.ts. Audit failure can
    //    never poison the response now that the mutation is durable.)
    try {
      await logFounderAction({
        actorUserId: req.user!.id,
        action: "agency_quick_named",
        entityType: "agency",
        entityId: newAgencyId,
        payload: {
          agencyId: newAgencyId,
          agencyName: newAgencyName,
          agentUserId,
          parentAgencyId: targetParentId,
          hierarchyChanged: needsPromotion,
          oldTitle: oldTitle ?? null,
          newTitle: needsPromotion ? TEAM_LEAD_TITLE : null,
        },
        viewingAs: viewingAsOf(req),
      });
    } catch (auditErr: any) {
      console.error(
        "[FoundersAgencies] promote-and-assign audit error:",
        auditErr?.message ?? auditErr,
      );
    }

    // Axiom BLOCK — emit live SSE events when (and only when) a promotion
    // actually fired. Mirrors the post-COMMIT pattern in
    // server/routes/hcms-hierarchy.ts: the hierarchy event broadcasts to every
    // admin SSE subscriber, while the per-user role event is filtered
    // server-side by `onRoleChanged` so it only reaches the affected agent's
    // open browser tab (which then re-fetches /api/auth/user). Event-bus
    // failures must never poison the HTTP response.
    if (needsPromotion) {
      try {
        const newRole = titleToRole(TEAM_LEAD_TITLE);
        emitHierarchyChanged({
          type: "hierarchy:changed",
          agentId: agentUserId,
          newTitle: TEAM_LEAD_TITLE,
          newRole,
          ts: new Date().toISOString(),
        });
        if (agentRole !== null && agentRole !== newRole) {
          emitRoleChanged({
            type: "role:changed",
            userId: agentUserId,
            oldRole: agentRole,
            newRole,
            ts: new Date().toISOString(),
          });
        }
      } catch (emitErr: any) {
        console.error(
          "[FoundersAgencies] promote-and-assign emit error:",
          emitErr?.message ?? emitErr,
        );
      }
    }

    return res.json({
      agencyId: newAgencyId,
      agencyName: newAgencyName,
      hierarchyChanged: needsPromotion,
      newTitle: needsPromotion ? TEAM_LEAD_TITLE : null,
    });
  } catch (e: any) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore rollback failure */
    }
    console.error(
      "[FoundersAgencies] promote-and-assign error:",
      e?.message ?? e,
    );
    return res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Failed to promote and assign"
          : e?.message || "Failed to promote and assign",
    });
  } finally {
    client.release();
  }
});

// ─── Agency carrier contracts ────────────────────────────────────────────────

router.get("/agencies/:id/carriers", async (req, res) => {
  const agencyId = req.params.id;
  if (!isUuid(agencyId)) return res.status(400).json({ error: "Invalid agency id" });
  try {
    const r = await pool.query(
      `SELECT acc.id::text AS id,
              acc.agency_id::text AS agency_id,
              acc.carrier_id::text AS carrier_id,
              cd.name AS carrier_name, cd.short_name AS carrier_short_name,
              acc.status, acc.mpa_effective_date, acc.mpa_expiration_date,
              acc.mpa_document_s3_key, acc.primary_contact_name,
              acc.primary_contact_email, acc.primary_contact_phone,
              acc.states_authorized, acc.writing_number, acc.notes,
              acc.created_at, acc.updated_at
         FROM agency_carrier_contracts acc
    LEFT JOIN carrier_directory cd ON cd.id::text = acc.carrier_id::text
        WHERE acc.agency_id = $1::uuid
        ORDER BY cd.name ASC NULLS LAST`,
      [agencyId],
    );

    res.json(r.rows);
  } catch (e: any) {
    console.error("[FoundersAgencies] list contracts error:", e?.message);
    res.status(500).json(genericError("Failed to load agency contracts"));
  }
});

router.post("/agencies/:id/carriers", blockWritesDuringViewAs, async (req, res) => {
  const agencyId = req.params.id;
  if (!isUuid(agencyId)) return res.status(400).json({ error: "Invalid agency id" });
  const {
    carrierId,
    status,
    mpaEffectiveDate,
    mpaExpirationDate,
    mpaDocumentS3Key,
    primaryContactName,
    primaryContactEmail,
    primaryContactPhone,
    statesAuthorized,
    writingNumber,
    notes,
  } = req.body || {};
  if (!carrierId || typeof carrierId !== "string") {
    return res.status(400).json({ error: "carrierId required" });
  }
  if (status && !VALID_CONTRACT_STATUS.has(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  if (writingNumber && (typeof writingNumber !== "string" || writingNumber.length > 50)) {
    return res.status(400).json({ error: "writingNumber must be a string up to 50 chars" });
  }
  try {
    const r = await pool.query(
      `INSERT INTO agency_carrier_contracts (
         agency_id, carrier_id, status,
         mpa_effective_date, mpa_expiration_date, mpa_document_s3_key,
         primary_contact_name, primary_contact_email, primary_contact_phone,
         states_authorized, writing_number, notes, created_by_user_id
       ) VALUES (
         $1::uuid, $2, COALESCE($3, 'active'),
         $4::date, $5::date, $6,
         $7, $8, $9,
         $10::jsonb, $11, $12, $13::uuid
       )
       ON CONFLICT (agency_id, carrier_id) DO UPDATE SET
         status = EXCLUDED.status,
         mpa_effective_date = EXCLUDED.mpa_effective_date,
         mpa_expiration_date = EXCLUDED.mpa_expiration_date,
         mpa_document_s3_key = EXCLUDED.mpa_document_s3_key,
         primary_contact_name = EXCLUDED.primary_contact_name,
         primary_contact_email = EXCLUDED.primary_contact_email,
         primary_contact_phone = EXCLUDED.primary_contact_phone,
         states_authorized = EXCLUDED.states_authorized,
         writing_number = EXCLUDED.writing_number,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING id::text AS id`,
      [
        agencyId,
        carrierId,
        status || null,
        mpaEffectiveDate || null,
        mpaExpirationDate || null,
        mpaDocumentS3Key || null,
        primaryContactName || null,
        primaryContactEmail || null,
        primaryContactPhone || null,
        statesAuthorized ? JSON.stringify(statesAuthorized) : null,
        writingNumber || null,
        notes || null,
        req.user!.id,
      ],
    );
    const id = r.rows[0].id;

    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_carrier_contract_added",
      entityType: "agency_carrier_contract",
      entityId: id,
      payload: { agencyId, carrierId, status: status || "active" },
      viewingAs: viewingAsOf(req),
    });

    res.json({ success: true, id });
  } catch (e: any) {
    console.error("[FoundersAgencies] add contract error:", e?.message);
    res.status(500).json(genericError("Failed to add agency contract"));
  }
});

router.patch("/agencies/:id/carriers/:contractId", blockWritesDuringViewAs, async (req, res) => {
  const { id: agencyId, contractId } = req.params;
  if (!isUuid(agencyId) || !isUuid(contractId)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const allowed: Record<string, string> = {
    status: "status",
    mpaEffectiveDate: "mpa_effective_date",
    mpaExpirationDate: "mpa_expiration_date",
    mpaDocumentS3Key: "mpa_document_s3_key",
    primaryContactName: "primary_contact_name",
    primaryContactEmail: "primary_contact_email",
    primaryContactPhone: "primary_contact_phone",
    statesAuthorized: "states_authorized",
    writingNumber: "writing_number",
    notes: "notes",
  };
  const sets: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [key, col] of Object.entries(allowed)) {
    if (!(key in (req.body || {}))) continue;
    const v = req.body[key];
    if (key === "status" && v !== null && !VALID_CONTRACT_STATUS.has(v)) {
      return res.status(400).json({ error: "Invalid contract status" });
    }
    if (key === "writingNumber" && v != null && (typeof v !== "string" || v.length > 50)) {
      return res.status(400).json({ error: "writingNumber must be a string up to 50 chars" });
    }
    if (key === "mpaEffectiveDate" || key === "mpaExpirationDate") {
      sets.push(`${col} = $${idx++}::date`);
      vals.push(v || null);
    } else if (key === "statesAuthorized") {
      sets.push(`${col} = $${idx++}::jsonb`);
      vals.push(v ? JSON.stringify(v) : null);
    } else {
      sets.push(`${col} = $${idx++}`);
      vals.push(v ?? null);
    }
  }
  if (sets.length === 0) {
    return res.status(400).json({ error: "No editable fields supplied" });
  }
  sets.push(`updated_at = NOW()`);
  vals.push(contractId, agencyId);
  try {
    const upd = await pool.query(
      `UPDATE agency_carrier_contracts SET ${sets.join(", ")}
        WHERE id = $${idx++}::uuid AND agency_id = $${idx}::uuid
        RETURNING id::text AS id`,
      vals,
    );
    if (upd.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_carrier_contract_updated",
      entityType: "agency_carrier_contract",
      entityId: contractId,
      payload: { agencyId, fields: Object.keys(req.body || {}) },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] patch contract error:", e?.message);
    res.status(500).json(genericError("Failed to update contract"));
  }
});

router.delete("/agencies/:id/carriers/:contractId", blockWritesDuringViewAs, async (req, res) => {
  const { id: agencyId, contractId } = req.params;
  if (!isUuid(agencyId) || !isUuid(contractId)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const upd = await pool.query(
      `UPDATE agency_carrier_contracts SET status = 'terminated', updated_at = NOW()
        WHERE id = $1::uuid AND agency_id = $2::uuid
        RETURNING id::text AS id`,
      [contractId, agencyId],
    );
    if (upd.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_carrier_contract_terminated",
      entityType: "agency_carrier_contract",
      entityId: contractId,
      payload: { agencyId },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] delete contract error:", e?.message);
    res.status(500).json(genericError("Failed to terminate contract"));
  }
});

// ─── Commission overrides ────────────────────────────────────────────────────

router.get("/agencies/:id/overrides", async (req, res) => {
  const agencyId = req.params.id;
  if (!isUuid(agencyId)) return res.status(400).json({ error: "Invalid agency id" });
  try {
    const r = await pool.query(
      `SELECT acco.id::text AS id,
              acco.agency_id::text AS agency_id,
              acco.carrier_id::text AS carrier_id,
              cd.name AS carrier_name,
              acco.product_type, acco.commission_pct_delta,
              acco.effective_from, acco.effective_to, acco.notes,
              acco.created_at
         FROM agency_carrier_commission_overrides acco
    LEFT JOIN carrier_directory cd ON cd.id::text = acco.carrier_id::text
        WHERE acco.agency_id = $1::uuid
        ORDER BY acco.effective_from DESC`,
      [agencyId],
    );
    res.json(r.rows);
  } catch (e: any) {
    console.error("[FoundersAgencies] list overrides error:", e?.message);
    res.status(500).json(genericError("Failed to load overrides"));
  }
});

router.post("/agencies/:id/overrides", blockWritesDuringViewAs, async (req, res) => {
  const agencyId = req.params.id;
  if (!isUuid(agencyId)) return res.status(400).json({ error: "Invalid agency id" });
  const { carrierId, productType, commissionPctDelta, effectiveFrom, effectiveTo, notes } =
    req.body || {};
  if (!carrierId) return res.status(400).json({ error: "carrierId required" });
  const delta = Number(commissionPctDelta);
  if (!Number.isFinite(delta)) {
    return res.status(400).json({ error: "commissionPctDelta required (numeric)" });
  }
  try {
    const r = await pool.query(
      `INSERT INTO agency_carrier_commission_overrides (
         agency_id, carrier_id, product_type, commission_pct_delta,
         effective_from, effective_to, notes, created_by_user_id
       ) VALUES (
         $1::uuid, $2, $3, $4::numeric,
         COALESCE($5::date, CURRENT_DATE), $6::date, $7, $8::uuid
       ) RETURNING id::text AS id`,
      [
        agencyId,
        carrierId,
        productType || null,
        delta,
        effectiveFrom || null,
        effectiveTo || null,
        notes || null,
        req.user!.id,
      ],
    );
    const id = r.rows[0].id;
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_commission_override_added",
      entityType: "agency_commission_override",
      entityId: id,
      payload: { agencyId, carrierId, productType, commissionPctDelta: delta },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true, id });
  } catch (e: any) {
    console.error("[FoundersAgencies] add override error:", e?.message);
    res.status(500).json(genericError("Failed to add override"));
  }
});

router.delete("/agencies/:id/overrides/:overrideId", blockWritesDuringViewAs, async (req, res) => {
  const { id: agencyId, overrideId } = req.params;
  if (!isUuid(agencyId) || !isUuid(overrideId)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    // Soft-delete by setting effective_to=today; matches plan semantics.
    const upd = await pool.query(
      `UPDATE agency_carrier_commission_overrides
          SET effective_to = CURRENT_DATE
        WHERE id = $1::uuid AND agency_id = $2::uuid
        RETURNING id::text AS id`,
      [overrideId, agencyId],
    );
    if (upd.rowCount === 0) {
      return res.status(404).json({ error: "Override not found" });
    }
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "agency_commission_override_ended",
      entityType: "agency_commission_override",
      entityId: overrideId,
      payload: { agencyId },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] delete override error:", e?.message);
    res.status(500).json(genericError("Failed to remove override"));
  }
});

// ─── Carrier directory CRUD (founder-only additions) ────────────────────────

router.post("/carriers", blockWritesDuringViewAs, async (req, res) => {
  const {
    name,
    shortName,
    code,
    naic,
    amBestRating,
    contractingUrl,
    trainingUrl,
    appointmentPhone,
    appointmentEmail,
    productTypes,
    statesAvailable,
    commissionAdvanceMonths,
    notes,
  } = req.body || {};
  if (!name || !shortName || !code) {
    return res.status(400).json({ error: "name, shortName, code required" });
  }
  try {
    const r = await pool.query(
      `INSERT INTO carrier_directory (
         name, short_name, code, naic, am_best_rating,
         contracting_url, training_url, appointment_phone, appointment_email,
         product_types, states_available, commission_advance_months, notes,
         is_active
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9,
         $10::jsonb, $11::jsonb, $12, $13, true
       ) RETURNING id`,
      [
        name,
        shortName,
        code,
        naic || null,
        amBestRating || null,
        contractingUrl || null,
        trainingUrl || null,
        appointmentPhone || null,
        appointmentEmail || null,
        productTypes ? JSON.stringify(productTypes) : "[]",
        statesAvailable ? JSON.stringify(statesAvailable) : "[]",
        Number.isFinite(Number(commissionAdvanceMonths))
          ? Number(commissionAdvanceMonths)
          : 9,
        notes || null,
      ],
    );
    const id = r.rows[0].id;
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "carrier_created",
      entityType: "carrier",
      entityId: id,
      payload: { name, code },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true, id });
  } catch (e: any) {
    if (String(e?.message || "").toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: "Carrier code already exists" });
    }
    console.error("[FoundersAgencies] create carrier error:", e?.message);
    res.status(500).json(genericError("Failed to create carrier"));
  }
});

router.patch("/carriers/:id", blockWritesDuringViewAs, async (req, res) => {
  // Sentinel HIGH 2 — carrier_directory.id is varchar(20). Reject anything
  // outside the canonical alphanumeric/code charset before it touches SQL.
  const id = String(req.params.id || "").trim();
  if (!id || id.length > 64 || !/^[A-Za-z0-9_\-:.]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid carrier id", code: "INVALID_CARRIER_ID" });
  }
  const allowed: Record<string, string> = {
    name: "name",
    shortName: "short_name",
    naic: "naic",
    amBestRating: "am_best_rating",
    contractingUrl: "contracting_url",
    trainingUrl: "training_url",
    appointmentPhone: "appointment_phone",
    appointmentEmail: "appointment_email",
    productTypes: "product_types",
    statesAvailable: "states_available",
    commissionAdvanceMonths: "commission_advance_months",
    notes: "notes",
    isActive: "is_active",
  };
  const sets: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [key, col] of Object.entries(allowed)) {
    if (!(key in (req.body || {}))) continue;
    const v = req.body[key];
    if (key === "productTypes" || key === "statesAvailable") {
      sets.push(`${col} = $${idx++}::jsonb`);
      vals.push(v ? JSON.stringify(v) : "[]");
    } else if (key === "isActive") {
      sets.push(`${col} = $${idx++}`);
      vals.push(!!v);
    } else if (key === "commissionAdvanceMonths") {
      sets.push(`${col} = $${idx++}`);
      vals.push(Number.isFinite(Number(v)) ? Number(v) : null);
    } else {
      sets.push(`${col} = $${idx++}`);
      vals.push(v ?? null);
    }
  }
  if (sets.length === 0) {
    return res.status(400).json({ error: "No editable fields supplied" });
  }
  sets.push(`updated_at = NOW()`);
  vals.push(id);
  try {
    const upd = await pool.query(
      `UPDATE carrier_directory SET ${sets.join(", ")}
        WHERE id = $${idx} RETURNING id`,
      vals,
    );
    if (upd.rowCount === 0) {
      return res.status(404).json({ error: "Carrier not found" });
    }
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "carrier_updated",
      entityType: "carrier",
      entityId: id,
      payload: { fields: Object.keys(req.body || {}) },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] patch carrier error:", e?.message);
    res.status(500).json(genericError("Failed to update carrier"));
  }
});

// ─── Carrier compliance requirements ─────────────────────────────────────────

router.get("/carriers/:id/compliance", async (req, res) => {
  // Sentinel HIGH 2 — defend the path param.
  const id = String(req.params.id || "").trim();
  if (!id || id.length > 64 || !/^[A-Za-z0-9_\-:.]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid carrier id", code: "INVALID_CARRIER_ID" });
  }
  try {
    const r = await pool.query(
      `SELECT id::text AS id, carrier_id::text AS carrier_id,
              requirement_type, required_value, notes, created_at
         FROM carrier_compliance_requirements
        WHERE carrier_id::text = $1
        ORDER BY requirement_type ASC`,
      [id],
    );
    res.json(r.rows);
  } catch (e: any) {
    console.error("[FoundersAgencies] list compliance error:", e?.message);
    res.status(500).json(genericError("Failed to load compliance requirements"));
  }
});

router.post("/carriers/:id/compliance", blockWritesDuringViewAs, async (req, res) => {
  // Sentinel HIGH 2 — defend the path param.
  const id = String(req.params.id || "").trim();
  if (!id || id.length > 64 || !/^[A-Za-z0-9_\-:.]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid carrier id", code: "INVALID_CARRIER_ID" });
  }
  const { requirementType, requiredValue, notes } = req.body || {};
  if (!requirementType || !VALID_REQ_TYPE.has(requirementType)) {
    return res.status(400).json({
      error:
        "requirementType must be one of: aml_training, eo_minimum, state_excluded, background_check, training_module",
    });
  }
  // Helix BLOCK 1 — eo_minimum is now a numeric string of DOLLARS (matches
  // how agent_profiles.eo_coverage_amount is stored).
  if (requirementType === "eo_minimum") {
    const n = parseInt(String(requiredValue), 10);
    if (!Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ error: "eo_minimum requires required_value in dollars (e.g. 1000000 for $1M)" });
    }
  }
  try {
    // Sentinel MED 5 — switch DO NOTHING → DO UPDATE so the row id is always
    // returned (never null), and the audit log entityId is always populated.
    const r = await pool.query(
      `INSERT INTO carrier_compliance_requirements
         (carrier_id, requirement_type, required_value, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (carrier_id, requirement_type, required_value)
         DO UPDATE SET notes = EXCLUDED.notes
       RETURNING id::text AS id, requirement_type, required_value, notes,
                 (xmax <> 0) AS conflict`,
      [id, requirementType, requiredValue ? String(requiredValue) : null, notes || null],
    );
    const row = r.rows[0];
    const newId = row?.id || null;
    const conflict = !!row?.conflict;
    await logFounderAction({
      actorUserId: req.user!.id,
      action: conflict ? "carrier_compliance_updated" : "carrier_compliance_added",
      entityType: "carrier_compliance_requirement",
      entityId: newId,
      payload: { carrierId: id, requirementType, requiredValue, conflict },
      viewingAs: viewingAsOf(req),
    });
    res.status(conflict ? 200 : 201).json({
      success: true,
      id: newId,
      conflict,
      requirement: row
        ? {
            id: row.id,
            requirement_type: row.requirement_type,
            required_value: row.required_value,
            notes: row.notes,
          }
        : null,
    });
  } catch (e: any) {
    console.error("[FoundersAgencies] add compliance error:", e?.message);
    res.status(500).json(genericError("Failed to add compliance requirement"));
  }
});

router.delete("/carriers/:id/compliance/:reqId", blockWritesDuringViewAs, async (req, res) => {
  // Sentinel HIGH 2 — defend the path param.
  const id = String(req.params.id || "").trim();
  const { reqId } = req.params;
  if (!id || id.length > 64 || !/^[A-Za-z0-9_\-:.]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid carrier id", code: "INVALID_CARRIER_ID" });
  }
  if (!isUuid(reqId)) {
    return res.status(400).json({ error: "Invalid requirement id" });
  }
  try {
    const del = await pool.query(
      `DELETE FROM carrier_compliance_requirements
        WHERE id = $1::uuid AND carrier_id::text = $2
        RETURNING id::text AS id`,
      [reqId, id],
    );
    if (del.rowCount === 0) {
      return res.status(404).json({ error: "Requirement not found" });
    }
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "carrier_compliance_removed",
      entityType: "carrier_compliance_requirement",
      entityId: reqId,
      payload: { carrierId: id },
      viewingAs: viewingAsOf(req),
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[FoundersAgencies] delete compliance error:", e?.message);
    res.status(500).json(genericError("Failed to remove compliance requirement"));
  }
});

export default router;
