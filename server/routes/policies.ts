import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { requireAuth } from "../routes";
import { insertAgentPolicySchema } from "@shared/models/policies";

const router = Router();
router.use(requireAuth);

// GET /api/policies/summary - Grouped by state for the map widget
router.get("/summary", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const policies = await storage.getAgentPolicies(userId);

    // Group by state
    const byState: Record<string, { count: number; totalPremium: number; totalCoverage: number }> = {};
    for (const p of policies) {
      if (!byState[p.stateCode]) {
        byState[p.stateCode] = { count: 0, totalPremium: 0, totalCoverage: 0 };
      }
      byState[p.stateCode].count++;
      byState[p.stateCode].totalPremium += p.premiumAmount || 0;
      byState[p.stateCode].totalCoverage += p.coverageAmount || 0;
    }

    const summary = Object.entries(byState).map(([stateCode, data]) => ({
      stateCode,
      ...data,
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
