/**
 * Automations API Routes
 * Real-time automation system for Heritage Life Solutions
 *
 * IMPORTANT: Route ordering follows best practices:
 * 1. Static/specific routes BEFORE parameterized routes
 * 2. This prevents Express from incorrectly matching parameters
 */

import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { requireAuth } from "../routes";
import { automationEngine } from "../services/automation-engine";
import {
  insertAutomationSchema,
  AUTOMATION_TEMPLATES,
  type Automation,
  type InsertAutomation,
} from "@shared/models/automations";

const router = Router();

// =============================================================================
// STATIC ROUTES (must come BEFORE parameterized routes)
// =============================================================================

/**
 * GET /api/automations
 * List all automations for the authenticated agent
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const automations = await storage.getAutomationsByAgentId(agentId);
    res.json(automations);
  } catch (error) {
    console.error("[Automations] Error fetching automations:", error);
    res.status(500).json({ error: "Failed to fetch automations" });
  }
});

/**
 * GET /api/automations/templates
 * Get available automation templates
 */
router.get("/templates", requireAuth, async (_req, res) => {
  try {
    res.json(AUTOMATION_TEMPLATES);
  } catch (error) {
    console.error("[Automations] Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

/**
 * GET /api/automations/executions/recent
 * Get recent executions across all automations for this agent
 * NOTE: This MUST be before /:id routes to prevent "executions" being matched as an ID
 */
router.get("/executions/recent", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const { limit = "50" } = req.query;

    const executions = await storage.getRecentExecutions(agentId, parseInt(limit as string));

    res.json(executions);
  } catch (error) {
    console.error("[Automations] Error fetching recent executions:", error);
    res.status(500).json({ error: "Failed to fetch recent executions" });
  }
});

/**
 * POST /api/automations
 * Create a new automation
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;

    // Validate request body
    const validatedData = insertAutomationSchema.parse({
      ...req.body,
      agentId,
    });

    const automation = await storage.createAutomation(validatedData as InsertAutomation);

    console.log(`[Automations] Created automation: ${automation.name} (${automation.id}) by agent ${agentId}`);

    res.status(201).json(automation);
  } catch (error: any) {
    if (error.name === "ZodError") {
      console.error("[Automations] Validation error:", fromZodError(error).toString());
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[Automations] Error creating automation:", error.message || error);
    console.error("[Automations] Full error:", error);
    res.status(500).json({ error: error.message || "Failed to create automation" });
  }
});

/**
 * POST /api/automations/from-template
 * Create an automation from a template
 */
router.post("/from-template", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const { templateId, name, description } = req.body;

    // Find the template
    const template = AUTOMATION_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Create automation from template
    const automationData: InsertAutomation = {
      agentId,
      name: name || template.name,
      description: description || template.description,
      enabled: true,
      triggerType: template.trigger.type,
      triggerConfig: template.trigger.config,
      conditions: template.conditions,
      actions: template.actions,
      templateId: template.id,
    };

    const validatedData = insertAutomationSchema.parse(automationData);
    const automation = await storage.createAutomation(validatedData as InsertAutomation);

    console.log(`[Automations] Created automation from template: ${template.name} -> ${automation.id}`);

    res.status(201).json(automation);
  } catch (error: any) {
    if (error.name === "ZodError") {
      console.error("[Automations] Validation error:", fromZodError(error).toString());
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[Automations] Error creating automation from template:", error.message || error);
    console.error("[Automations] Full error:", error);
    res.status(500).json({ error: error.message || "Failed to create automation from template" });
  }
});

// =============================================================================
// PARAMETERIZED ROUTES (must come AFTER static routes)
// =============================================================================

/**
 * GET /api/automations/:id
 * Get a specific automation by ID
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    const automation = await storage.getAutomationById(id);

    if (!automation) {
      return res.status(404).json({ error: "Automation not found" });
    }

    // Verify ownership
    if (automation.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(automation);
  } catch (error) {
    console.error("[Automations] Error fetching automation:", error);
    res.status(500).json({ error: "Failed to fetch automation" });
  }
});

/**
 * PUT /api/automations/:id
 * Update an automation
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    // Verify ownership
    const existing = await storage.getAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Automation not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update automation
    const updated = await storage.updateAutomation(id, req.body);

    console.log(`[Automations] Updated automation: ${id}`);

    res.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[Automations] Error updating automation:", error);
    res.status(500).json({ error: "Failed to update automation" });
  }
});

/**
 * DELETE /api/automations/:id
 * Delete an automation
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    // Verify ownership
    const existing = await storage.getAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Automation not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await storage.deleteAutomation(id);

    console.log(`[Automations] Deleted automation: ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error("[Automations] Error deleting automation:", error);
    res.status(500).json({ error: "Failed to delete automation" });
  }
});

/**
 * PATCH /api/automations/:id/toggle
 * Enable or disable an automation
 */
router.patch("/:id/toggle", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const agentId = req.session.userId!;

    // Verify ownership
    const existing = await storage.getAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Automation not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await storage.toggleAutomation(id, enabled);

    console.log(`[Automations] Toggled automation ${id}: enabled=${enabled}`);

    res.json(updated);
  } catch (error) {
    console.error("[Automations] Error toggling automation:", error);
    res.status(500).json({ error: "Failed to toggle automation" });
  }
});

/**
 * GET /api/automations/:id/executions
 * Get execution history for an automation
 */
router.get("/:id/executions", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = "50" } = req.query;
    const agentId = req.session.userId!;

    // Verify ownership
    const existing = await storage.getAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Automation not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const executions = await storage.getExecutionsByAutomationId(id, parseInt(limit as string));

    res.json(executions);
  } catch (error) {
    console.error("[Automations] Error fetching executions:", error);
    res.status(500).json({ error: "Failed to fetch executions" });
  }
});

/**
 * POST /api/automations/:id/test
 * Test run an automation (dry run - simulates execution without side effects)
 */
router.post("/:id/test", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { testData } = req.body;
    const agentId = req.session.userId!;

    // Verify ownership
    const automation = await storage.getAutomationById(id);
    if (!automation) {
      return res.status(404).json({ error: "Automation not found" });
    }
    if (automation.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Create a test execution record showing what would happen
    const actions = automation.actions as Array<{ type: string; config: Record<string, unknown> }>;
    const conditions = automation.conditions as Array<{ field: string; operator: string; value: unknown }>;

    const execution = await storage.createAutomationExecution({
      automationId: id,
      status: "completed",
      triggeredBy: { type: "test", testData },
      conditionResults: {
        passed: true,
        conditions: conditions.map(c => ({
          field: c.field,
          operator: c.operator,
          expected: c.value,
          passed: true, // Assume pass for test
        })),
      },
      actionResults: actions.map((action, index) => ({
        actionIndex: index,
        type: action.type,
        status: "simulated",
        result: { message: `Would execute: ${action.type}`, config: action.config },
      })),
    });

    console.log(`[Automations] Test run for automation ${id}`);

    res.json({
      success: true,
      execution,
      message: "Test run completed (no actions were actually executed)",
    });
  } catch (error) {
    console.error("[Automations] Error testing automation:", error);
    res.status(500).json({ error: "Failed to test automation" });
  }
});

/**
 * POST /api/automations/:id/run
 * Manually trigger an automation
 */
router.post("/:id/run", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerData } = req.body;
    const agentId = req.session.userId!;

    // Verify ownership
    const automation = await storage.getAutomationById(id);
    if (!automation) {
      return res.status(404).json({ error: "Automation not found" });
    }
    if (automation.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Execute the automation via AutomationEngine
    const execution = await automationEngine.executeAutomation(automation, {
      type: "manual",
      triggeredBy: agentId,
      data: triggerData || {},
    });

    console.log(`[Automations] Manual run for automation ${id}: ${execution.status}`);

    res.json({
      success: execution.status === "completed",
      execution,
    });
  } catch (error) {
    console.error("[Automations] Error running automation:", error);
    res.status(500).json({ error: "Failed to run automation" });
  }
});

export default router;
