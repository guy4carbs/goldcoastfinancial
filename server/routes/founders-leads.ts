import { Router } from "express";
import multer from "multer";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole, FOUNDERS_ONLY, blockWritesDuringViewAs } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { foundersEventBus } from "../services/foundersEventBus";
import { listTeams, listTeamAgents } from "../services/teamDerivation";
import { getDateRange } from "../utils/dateRange";
import { genericError } from "./founders-book";

const router = Router();

// Multer: in-memory, 50MB limit, whitelisted MIME types.
const ALLOWED_MIME = new Set<string>([
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okExt = /\.(csv|xlsx|xls)$/i.test(file.originalname || "");
    if (ALLOWED_MIME.has(file.mimetype) || okExt) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// SSE route is intentionally NOT gated by viewAs write blocker (it's a GET).
// Founders Lounge is founders-only. Wave Y tightened from ADMIN_PLUS → FOUNDERS_ONLY
// (Owner + System Admin no longer access /founders/* per founder mandate).
router.use(requireAuth, requireRole(...FOUNDERS_ONLY));

// Column auto-detect regex map
const COLUMN_PATTERNS: Record<string, RegExp> = {
  email: /^(email|e-?mail)/i,
  phone: /^(phone|mobile|cell)/i,
  firstName: /^(first.?name|fname|given)/i,
  lastName: /^(last.?name|lname|surname|family)/i,
  source: /^source/i,
  coverageType: /^(coverage|product|type)/i,
  estimatedValue: /^(value|estimated|est.?value|premium)/i,
  leadScore: /^(score|lead.?score)/i,
  city: /^city/i,
  state: /^state/i,
};

function tierFromScore(score: number): "cold" | "warm" | "hot" | "on_fire" {
  if (score >= 86) return "on_fire";
  if (score >= 61) return "hot";
  if (score >= 31) return "warm";
  return "cold";
}

function mapHeaders(rawHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const header of rawHeaders) {
    if (!header) continue;
    for (const [field, regex] of Object.entries(COLUMN_PATTERNS)) {
      if (mapping[field]) continue;
      if (regex.test(header.toString().trim())) {
        mapping[field] = header;
        break;
      }
    }
  }
  return mapping;
}

interface NormalizedRow {
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  source: string;
  coverageType: string | null;
  estimatedValue: number | null;
  leadScore: number;
  city: string | null;
  state: string | null;
}

function normalizeRow(row: any, headerMap: Record<string, string>): NormalizedRow {
  const get = (field: string): any => {
    const key = headerMap[field];
    if (!key) return null;
    const v = row[key];
    return v === undefined ? null : v;
  };
  const num = (v: any): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.\-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  const str = (v: any): string => {
    if (v === null || v === undefined) return "";
    return String(v).trim();
  };

  return {
    email: str(get("email")).toLowerCase() || null,
    phone: str(get("phone")) || null,
    firstName: str(get("firstName")),
    lastName: str(get("lastName")),
    source: str(get("source")) || "csv_import",
    coverageType: str(get("coverageType")) || null,
    estimatedValue: num(get("estimatedValue")),
    leadScore: Math.max(0, Math.min(100, num(get("leadScore")) || 0)),
    city: str(get("city")) || null,
    state: str(get("state")) || null,
  };
}

// GET /kpis
router.get("/kpis", async (req, res) => {
  const period = (req.query.period as string) || "ytd";
  try {
    const range = getDateRange(period);
    // Volume KPIs are gated by created_at within [start, end+1day). The
    // `distributed` count is gated by distributed_at instead so a batch that
    // shipped this period still shows up even if the underlying leads were
    // imported earlier (matches the founders-teams.ts period-scoping pattern).
    const r = await pool.query(
      `SELECT
         COUNT(*) FILTER (
           WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
         )::int AS total,
         COUNT(*) FILTER (
           WHERE status = 'new' AND distributed_to IS NULL
             AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
         )::int AS in_pool,
         COUNT(*) FILTER (
           WHERE source = 'web_form'
             AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
         )::int AS from_website,
         COUNT(*) FILTER (
           WHERE distribution_batch_id IS NOT NULL
             AND distributed_at >= $1::date AND distributed_at < ($2::date + INTERVAL '1 day')
         )::int AS distributed,
         COUNT(*) FILTER (
           WHERE lead_score_tier IN ('hot','on_fire')
             AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
         )::int AS hot,
         COUNT(*) FILTER (
           WHERE status = 'won'
             AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
         )::int AS won
       FROM leads`,
      [range.start, range.end],
    );
    const row = r.rows[0] || {};
    const total = Number(row.total) || 0;
    const won = Number(row.won) || 0;
    res.json({
      total,
      inPool: Number(row.in_pool) || 0,
      fromWebsite: Number(row.from_website) || 0,
      distributed: Number(row.distributed) || 0,
      hot: Number(row.hot) || 0,
      successRate: total > 0 ? (won / total) * 100 : 0,
    });
  } catch (e: any) {
    console.error("[founders-leads] /kpis error:", e?.message);
    res.status(500).json(genericError("Failed to load lead KPIs"));
  }
});

// GET /pool
router.get("/pool", async (req, res) => {
  try {
    const source = req.query.source as string | undefined;
    const priority = req.query.priority as string | undefined;
    const status = (req.query.status as string | undefined) || "new";
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const params: any[] = [];
    const where: string[] = [];
    if (status === "new") {
      where.push(`status = 'new'`);
      where.push(`distributed_to IS NULL`);
    } else {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (source) {
      params.push(source);
      where.push(`source = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      where.push(`priority = $${params.length}`);
    }
    params.push(limit);
    params.push(offset);

    const r = await pool.query(
      `SELECT id, first_name, last_name, email, phone,
              street_address, city, state, zip_code,
              source, source_id, priority, status, pipeline_stage,
              lead_score, score_tier, lead_score_tier,
              coverage_type, coverage_amount, estimated_value,
              notes, enrichment_data,
              created_at, distributed_to, distributed_at,
              distribution_batch_id, assigned_to
       FROM leads
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    res.json(
      r.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        email: row.email || "",
        phone: row.phone || "",
        streetAddress: row.street_address || null,
        city: row.city || "",
        state: row.state || "",
        zipCode: row.zip_code || null,
        source: row.source || "",
        sourceId: row.source_id || null,
        priority: row.priority || "medium",
        status: row.status || "new",
        pipelineStage: row.pipeline_stage || "new",
        leadScore: Number(row.lead_score) || 0,
        // score_tier (heritage-app canonical) preferred; fall back to
        // lead_score_tier (founders-side legacy) then derive from numeric score.
        leadScoreTier:
          row.score_tier || row.lead_score_tier || tierFromScore(Number(row.lead_score) || 0),
        coverageType: row.coverage_type || null,
        coverageAmount: row.coverage_amount || null,
        estimatedValue: row.estimated_value ? Number(row.estimated_value) : null,
        notes: row.notes || null,
        enrichmentData: row.enrichment_data || null,
        createdAt: row.created_at,
        distributedTo: row.distributed_to || null,
        distributedAt: row.distributed_at || null,
        distributionBatchId: row.distribution_batch_id || null,
        assignedTo: row.assigned_to || null,
      })),
    );
  } catch (e: any) {
    console.error("[founders-leads] /pool error:", e?.message);
    res.status(500).json(genericError("Failed to load lead pool"));
  }
});

// GET /managers
router.get("/managers", async (_req, res) => {
  try {
    const teams = await listTeams();
    res.json(
      teams.map((t) => ({
        id: t.manager.id,
        firstName: t.manager.firstName,
        lastName: t.manager.lastName,
        email: t.manager.email,
        teamName: t.name,
        agentCount: t.agentCount,
      })),
    );
  } catch (e: any) {
    console.error("[founders-leads] /managers error:", e?.message);
    res.status(500).json(genericError("Failed to load managers"));
  }
});

// GET /imports
router.get("/imports", async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const r = await pool.query(
      `SELECT id, user_id, file_name, total_rows, imported_rows, skipped_rows,
              error_rows, source, error_details, created_at
       FROM import_history
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
    res.json(
      r.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        fileName: row.file_name,
        totalRows: Number(row.total_rows) || 0,
        importedRows: Number(row.imported_rows) || 0,
        skippedRows: Number(row.skipped_rows) || 0,
        errorRows: Number(row.error_rows) || 0,
        source: row.source,
        createdAt: row.created_at,
      })),
    );
  } catch (e: any) {
    console.error("[founders-leads] /imports error:", e?.message);
    res.status(500).json(genericError("Failed to load import history"));
  }
});

// GET /distribution-history?limit=20
// Aggregates distributed leads into batches, then groups per-manager so the
// FE gets a ready-to-render nested shape. Limit clamped to 50.
router.get("/distribution-history", async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  try {
    const r = await pool.query(
      `SELECT l.distribution_batch_id::text AS batch_id,
              l.distributed_to::text         AS manager_id,
              MIN(l.distributed_at)          AS distributed_at,
              COUNT(*)::int                  AS lead_count,
              MIN(u.first_name)              AS manager_first_name,
              MIN(u.last_name)               AS manager_last_name
       FROM leads l
       LEFT JOIN users u ON u.id = l.distributed_to
       WHERE l.distribution_batch_id IS NOT NULL
       GROUP BY l.distribution_batch_id, l.distributed_to`,
      [],
    );

    // Fold per-(batch,manager) rows into per-batch shape with managers[].
    type BatchRow = {
      batchId: string;
      distributedAt: string | Date;
      totalLeads: number;
      managers: Array<{ managerId: string; managerName: string; leadCount: number }>;
    };
    const byBatch = new Map<string, BatchRow>();
    for (const row of r.rows) {
      const batchId: string = row.batch_id;
      if (!batchId) continue;
      const distributedAt: string | Date = row.distributed_at;
      const leadCount = Number(row.lead_count) || 0;
      const managerName =
        [row.manager_first_name, row.manager_last_name].filter(Boolean).join(" ").trim() ||
        "Unknown";

      let entry = byBatch.get(batchId);
      if (!entry) {
        entry = { batchId, distributedAt, totalLeads: 0, managers: [] };
        byBatch.set(batchId, entry);
      }
      entry.totalLeads += leadCount;
      // Keep the earliest distributed_at across all manager rows for this batch.
      if (distributedAt && new Date(distributedAt) < new Date(entry.distributedAt)) {
        entry.distributedAt = distributedAt;
      }
      entry.managers.push({
        managerId: row.manager_id || "",
        managerName,
        leadCount,
      });
    }

    const batches = Array.from(byBatch.values())
      .sort((a, b) => new Date(b.distributedAt).getTime() - new Date(a.distributedAt).getTime())
      .slice(0, limit);

    res.json(batches);
  } catch (e: any) {
    console.error("[founders-leads] /distribution-history error:", e?.message);
    res.status(500).json(genericError("Failed to load distribution history"));
  }
});

// POST /import
router.post("/import", blockWritesDuringViewAs, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded (field name: file)" });
  const file = req.file;
  const fileName = file.originalname || "upload";
  const isXlsx = /\.(xlsx|xls)$/i.test(fileName) ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel";

  let parsedRows: any[] = [];
  let parsedHeaders: string[] = [];

  try {
    if (isXlsx) {
      const wb = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) return res.status(400).json({ error: "Workbook has no sheets" });
      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: false, defval: "" });
      parsedRows = json;
      parsedHeaders = json.length > 0 ? Object.keys(json[0]) : [];
    } else {
      const text = file.buffer.toString("utf8");
      const result = Papa.parse<Record<string, any>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });
      parsedRows = result.data;
      parsedHeaders = result.meta?.fields || (parsedRows[0] ? Object.keys(parsedRows[0]) : []);
    }
  } catch (e: any) {
    return res.status(400).json({ error: `Parse failed: ${e.message}` });
  }

  if (parsedRows.length === 0) {
    return res.status(400).json({ error: "File contains no rows" });
  }

  const headerMap = mapHeaders(parsedHeaders);
  const totalRows = parsedRows.length;
  const candidates: NormalizedRow[] = [];
  let skippedMissingContact = 0;
  for (const raw of parsedRows) {
    const norm = normalizeRow(raw, headerMap);
    if (!norm.email && !norm.phone) {
      skippedMissingContact += 1;
      continue;
    }
    if (!norm.firstName) norm.firstName = "Lead";
    if (!norm.lastName) norm.lastName = "Imported";
    candidates.push(norm);
  }

  // Dedupe by email against existing leads.
  const emails = candidates.map((c) => c.email).filter(Boolean) as string[];
  let existingEmails = new Set<string>();
  if (emails.length > 0) {
    try {
      const dup = await pool.query(
        `SELECT LOWER(email) AS email FROM leads WHERE LOWER(email) = ANY($1::text[])`,
        [emails],
      );
      existingEmails = new Set(dup.rows.map((r: any) => (r.email || "").toLowerCase()));
    } catch {
      /* swallow */
    }
  }

  const toInsert = candidates.filter((c) => !c.email || !existingEmails.has(c.email));
  const duplicates = candidates.length - toInsert.length;
  const skipped = skippedMissingContact + duplicates;

  let inserted = 0;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (toInsert.length > 0) {
      const cols = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "source",
        "city",
        "state",
        "coverage_type",
        "estimated_value",
        "lead_score",
        "lead_score_tier",
        "status",
        "pipeline_stage",
      ];
      const valuesSql: string[] = [];
      const params: any[] = [];
      let p = 0;
      for (const row of toInsert) {
        const tier = tierFromScore(row.leadScore);
        valuesSql.push(
          `($${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p}, $${++p}, 'new', 'new')`,
        );
        params.push(
          row.firstName,
          row.lastName,
          row.email,
          row.phone,
          row.source || "csv_import",
          row.city,
          row.state,
          row.coverageType,
          row.estimatedValue,
          row.leadScore,
          tier,
        );
      }
      const insertSql = `INSERT INTO leads (${cols.join(", ")}) VALUES ${valuesSql.join(", ")} RETURNING id`;
      const ins = await client.query(insertSql, params);
      inserted = ins.rowCount || 0;
    }

    const importRow = await client.query(
      `INSERT INTO import_history (user_id, file_name, total_rows, imported_rows, skipped_rows, error_rows, source)
       VALUES ($1, $2, $3, $4, $5, 0, 'csv_import')
       RETURNING id`,
      [req.user!.id, fileName, totalRows, inserted, skipped],
    );
    const importId = importRow.rows[0].id;

    await logFounderAction({
      client,
      actorUserId: req.user!.id,
      action: "leads_imported",
      entityType: "import_history",
      entityId: importId,
      brand: "gc",
      payload: { fileName, totalRows, accepted: inserted, skipped, duplicates },
      viewingAs: (req.session as any)?.viewingAs || null,
    });

    await client.query("COMMIT");

    foundersEventBus.emitFounder({
      type: "lead:imported",
      importId,
      accepted: inserted,
      skipped,
    });

    res.json({ importId, accepted: inserted, skipped, duplicates });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[founders-leads] /import error:", e?.message);
    res.status(500).json(genericError("Import failed"));
  } finally {
    client.release();
  }
});

// POST /distribute
const distributeSchema = z.object({
  scope: z.enum(["all", "ids", "count"]),
  ids: z.array(z.string().uuid()).optional(),
  count: z.number().int().positive().optional(),
});

router.post("/distribute", blockWritesDuringViewAs, async (req, res) => {
  const parsed = distributeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
  }
  const { scope, ids, count } = parsed.data;
  if (scope === "ids" && (!ids || ids.length === 0)) {
    return res.status(400).json({ error: "ids required for scope=ids" });
  }
  if (scope === "count" && (!count || count <= 0)) {
    return res.status(400).json({ error: "count required for scope=count" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Pull pool leads
    let leadIds: string[] = [];
    if (scope === "ids") {
      const r = await client.query(
        `SELECT id FROM leads
         WHERE id = ANY($1::uuid[])
           AND status = 'new'
           AND distributed_to IS NULL
         ORDER BY created_at ASC
         FOR UPDATE`,
        [ids],
      );
      leadIds = r.rows.map((row: any) => row.id);
    } else {
      const limit = scope === "count" ? count! : 1000;
      const r = await client.query(
        `SELECT id FROM leads
         WHERE status = 'new' AND distributed_to IS NULL
         ORDER BY created_at ASC
         LIMIT $1
         FOR UPDATE`,
        [limit],
      );
      leadIds = r.rows.map((row: any) => row.id);
    }

    if (leadIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No leads in pool to distribute" });
    }

    const teams = await listTeams();
    if (teams.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No managers available for distribution" });
    }

    const managerIds = teams.map((t) => t.manager.id);

    // Generate batch id
    const batchRes = await client.query(`SELECT gen_random_uuid()::text AS id`);
    const batchId = batchRes.rows[0].id;

    // Round-robin assign
    const assignmentsMap: Record<string, string[]> = {};
    for (const id of managerIds) assignmentsMap[id] = [];
    leadIds.forEach((leadId, i) => {
      const managerId = managerIds[i % managerIds.length];
      assignmentsMap[managerId].push(leadId);
    });

    // Bulk update
    for (let i = 0; i < leadIds.length; i++) {
      const leadId = leadIds[i];
      const managerId = managerIds[i % managerIds.length];
      await client.query(
        `UPDATE leads
         SET distributed_to = $1, distributed_at = NOW(), distribution_batch_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [managerId, batchId, leadId],
      );
    }

    await logFounderAction({
      client,
      actorUserId: req.user!.id,
      action: "leads_distributed",
      entityType: "leads",
      entityId: batchId,
      brand: "gc",
      payload: { batchId, leadCount: leadIds.length, managerIds },
      viewingAs: (req.session as any)?.viewingAs || null,
    });

    await client.query("COMMIT");

    foundersEventBus.emitFounder({
      type: "lead:distributed",
      batchId,
      managerIds,
      leadCount: leadIds.length,
    });

    res.json({
      batchId,
      assignments: Object.entries(assignmentsMap).map(([managerId, leadIdList]) => ({
        managerId,
        leadIds: leadIdList,
      })),
    });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[founders-leads] /distribute error:", e?.message);
    res.status(500).json(genericError("Distribution failed"));
  } finally {
    client.release();
  }
});

// POST /:id/assign
const assignSchema = z.object({ agentUserId: z.string().uuid() });

router.post("/:id/assign", blockWritesDuringViewAs, async (req, res) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
  }
  const leadId = req.params.id;
  const { agentUserId } = parsed.data;

  const client = await pool.connect();
  try {
    // Verify the agent is in some manager's downline (i.e. has an
    // agent_hierarchy row whose upline_chain references any manager).
    const ok = await client.query(
      `SELECT 1
       FROM agent_hierarchy ah
       WHERE ah.agent_user_id = $1
         AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
         AND EXISTS (
           SELECT 1 FROM agent_hierarchy m
           WHERE m.hierarchy_level IN (3, 4)
             AND ah.upline_chain @> to_jsonb(ARRAY[m.agent_user_id::text])
         )
       LIMIT 1`,
      [agentUserId],
    );
    if (ok.rows.length === 0) {
      return res.status(400).json({ error: "Agent is not in any manager's downline" });
    }

    await client.query("BEGIN");
    const r = await client.query(
      `UPDATE leads SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [agentUserId, leadId],
    );
    if (r.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Lead not found" });
    }

    await logFounderAction({
      client,
      actorUserId: req.user!.id,
      action: "lead_assigned",
      entityType: "leads",
      entityId: leadId,
      brand: "gc",
      payload: { agentUserId },
      viewingAs: (req.session as any)?.viewingAs || null,
    });

    await client.query("COMMIT");
    res.json({ ok: true, leadId, agentUserId });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[founders-leads] /:id/assign error:", e?.message);
    res.status(500).json(genericError("Assignment failed"));
  } finally {
    client.release();
  }
});

// GET /activities/:leadId
router.get("/activities/:leadId", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, lead_id, type, title, description, old_status, new_status,
              performed_by, created_at
       FROM lead_activities
       WHERE lead_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.params.leadId],
    );
    res.json(
      r.rows.map((row: any) => ({
        id: row.id,
        leadId: row.lead_id,
        type: row.type,
        title: row.title,
        description: row.description,
        oldStatus: row.old_status,
        newStatus: row.new_status,
        performedBy: row.performed_by,
        createdAt: row.created_at,
      })),
    );
  } catch (e: any) {
    console.error("Founders leads activities error:", e.message);
    res.json([]);
  }
});

// GET /stream — SSE
router.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  const write = (data: any) => {
    if (closed) return;
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      closed = true;
    }
  };

  write({ type: "ready", at: new Date().toISOString() });

  const unsubscribe = foundersEventBus.onFounder((ev) => write(ev));

  // Keepalive comment every 25s
  const keepalive = setInterval(() => {
    if (closed) return;
    try {
      res.write(":\n\n");
    } catch {
      closed = true;
    }
  }, 25000);

  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(keepalive);
    try {
      unsubscribe();
    } catch {
      /* noop */
    }
    try {
      res.end();
    } catch {
      /* noop */
    }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
  res.on("close", cleanup);
});

export default router;
