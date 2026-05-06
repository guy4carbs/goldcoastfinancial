import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS } from "../middleware/auth";
import { syncAgentLicenses, addManualLicense, getAgentLicenses } from "../services/licenseSyncService";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Agent: GET /api/agent-portal/licenses — Own licenses
// ─────────────────────────────────────────────────────────────────────────────
router.get("/agent", requireAuth, async (req, res) => {
  try {
    const licenses = await getAgentLicenses(req.user!.id);
    res.json(licenses);
  } catch (e: any) {
    console.error("[Licenses]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: GET /api/licenses/agent/:agentId — Licenses for a specific agent
// ─────────────────────────────────────────────────────────────────────────────
router.get("/agent/:agentId", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const licenses = await getAgentLicenses(req.params.agentId);
    res.json(licenses);
  } catch (e: any) {
    console.error("[Licenses]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: POST /api/licenses/sync/:agentId — Trigger sync for an agent
// ─────────────────────────────────────────────────────────────────────────────
router.post("/sync/:agentId", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    // Get agent's NPN
    const npnResult = await pool.query("SELECT npn FROM agent_profiles WHERE user_id::text = $1", [req.params.agentId]);
    const npn = npnResult.rows[0]?.npn;
    if (!npn) return res.status(400).json({ error: "Agent has no NPN on file" });

    const result = await syncAgentLicenses(npn, req.params.agentId);
    res.json(result);
  } catch (e: any) {
    console.error("[Licenses]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: POST /api/licenses/manual — Add a license manually
// ─────────────────────────────────────────────────────────────────────────────
router.post("/manual", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentUserId, stateCode, licenseNumber, licenseType, status, effectiveDate, expirationDate, isResident } = req.body;
    if (!agentUserId || !stateCode) return res.status(400).json({ error: "agentUserId and stateCode required" });

    const id = await addManualLicense(agentUserId, {
      stateCode, licenseNumber: licenseNumber || "", licenseType: licenseType || "life_health",
      status: status || "active", effectiveDate: effectiveDate || null,
      expirationDate: expirationDate || null, isResident: isResident || false,
    });
    res.json({ success: true, id });
  } catch (e: any) {
    console.error("[Licenses]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: DELETE /api/licenses/:licenseId — Remove a license
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:licenseId", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    await pool.query("DELETE FROM agent_licenses WHERE id = $1", [req.params.licenseId]);
    res.json({ success: true });
  } catch (e: any) {
    console.error("[Licenses]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
