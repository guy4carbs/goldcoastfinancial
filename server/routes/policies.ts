import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { pool } from "../db";
import { requireAuth } from "../routes";
import { insertAgentPolicySchema } from "@shared/models/policies";

const router = Router();
router.use(requireAuth);

// GET /api/policies/summary - Grouped by state for the map widget
// Single source: policies table only (no double-counting with agent_policies)
// Returns AP (Annual Premium = monthly_premium * 12)
router.get("/summary", async (req, res) => {
  try {
    const userId = String(req.session.userId);

    const result = await pool.query(
      `SELECT state_code,
              COUNT(*) as cnt,
              COALESCE(SUM(CAST(monthly_premium AS NUMERIC) * 12), 0)::float as total_ap,
              COALESCE(SUM(coverage_amount), 0)::float as total_coverage
       FROM policies
       WHERE agent_id = $1 AND state_code IS NOT NULL AND state_code != ''
       GROUP BY state_code`,
      [userId]
    );

    const summary = result.rows.map((r: any) => ({
      stateCode: r.state_code,
      count: parseInt(r.cnt),
      totalPremium: r.total_ap,
      totalCoverage: r.total_coverage,
    }));

    res.json({ policies: summary });
  } catch (error) {
    console.error("[Policies] Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch policy summary" });
  }
});

// GET /api/policies - List agent's policies
router.get("/", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const policies = await storage.getAgentPolicies(userId);
    res.json(policies);
  } catch (error) {
    console.error("[Policies] Error fetching policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// POST /api/policies - Create a policy
router.post("/", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const data = insertAgentPolicySchema.parse({
      ...req.body,
      userId,
    });
    const policy = await storage.createAgentPolicy(data);
    res.status(201).json(policy);
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error("[Policies] Error creating policy:", error);
    res.status(500).json({ error: "Failed to create policy" });
  }
});

// PUT /api/policies/:id - Update a policy
router.put("/:id", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const policy = await storage.getAgentPolicyById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (policy.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const updated = await storage.updateAgentPolicy(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("[Policies] Error updating policy:", error);
    res.status(500).json({ error: "Failed to update policy" });
  }
});

// DELETE /api/policies/:id - Delete a policy
router.delete("/:id", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const policy = await storage.getAgentPolicyById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (policy.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await storage.deleteAgentPolicy(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("[Policies] Error deleting policy:", error);
    res.status(500).json({ error: "Failed to delete policy" });
  }
});

export default router;
