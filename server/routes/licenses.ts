import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { requireAuth } from "../routes";
import { insertAgentLicenseSchema, insertAgentTerritorySchema } from "@shared/models/licenses";

const router = Router();
router.use(requireAuth);

// GET /api/licenses/summary - Combined data for the map widget
router.get("/summary", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const [licenses, territories] = await Promise.all([
      storage.getAgentLicenses(userId),
      storage.getAgentTerritories(userId),
    ]);
    res.json({ licenses, territories });
  } catch (error) {
    console.error("[Licenses] Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch license summary" });
  }
});

// GET /api/licenses/territories - List agent's territories
router.get("/territories", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const territories = await storage.getAgentTerritories(userId);
    res.json(territories);
  } catch (error) {
    console.error("[Licenses] Error fetching territories:", error);
    res.status(500).json({ error: "Failed to fetch territories" });
  }
});

// POST /api/licenses/territories - Assign a territory
router.post("/territories", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const data = insertAgentTerritorySchema.parse({
      ...req.body,
      userId,
    });
    const territory = await storage.createAgentTerritory(data);
    res.status(201).json(territory);
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error("[Licenses] Error creating territory:", error);
    res.status(500).json({ error: "Failed to create territory" });
  }
});

// DELETE /api/licenses/territories/:id - Remove a territory
router.delete("/territories/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteAgentTerritory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Territory not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("[Licenses] Error deleting territory:", error);
    res.status(500).json({ error: "Failed to delete territory" });
  }
});

// GET /api/licenses - List agent's licenses
router.get("/", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const licenses = await storage.getAgentLicenses(userId);
    res.json(licenses);
  } catch (error) {
    console.error("[Licenses] Error fetching licenses:", error);
    res.status(500).json({ error: "Failed to fetch licenses" });
  }
});

// POST /api/licenses - Create a license
router.post("/", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const data = insertAgentLicenseSchema.parse({
      ...req.body,
      userId,
    });
    const license = await storage.createAgentLicense(data);
    res.status(201).json(license);
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error("[Licenses] Error creating license:", error);
    res.status(500).json({ error: "Failed to create license" });
  }
});

// PUT /api/licenses/:id - Update a license
router.put("/:id", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const license = await storage.getAgentLicenseById(req.params.id);
    if (!license) {
      return res.status(404).json({ error: "License not found" });
    }
    if (license.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const updated = await storage.updateAgentLicense(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("[Licenses] Error updating license:", error);
    res.status(500).json({ error: "Failed to update license" });
  }
});

// DELETE /api/licenses/:id - Delete a license
router.delete("/:id", async (req, res) => {
  try {
    const userId = String(req.session.userId);
    const license = await storage.getAgentLicenseById(req.params.id);
    if (!license) {
      return res.status(404).json({ error: "License not found" });
    }
    if (license.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await storage.deleteAgentLicense(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("[Licenses] Error deleting license:", error);
    res.status(500).json({ error: "Failed to delete license" });
  }
});

export default router;
