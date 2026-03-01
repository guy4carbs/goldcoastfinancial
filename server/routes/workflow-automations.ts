/**
 * Workflow Automations API Routes
 * CRUD operations for visual workflow builder
 */

import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { requireAuth } from "../routes";
import { workflowEngine } from "../services/workflow-engine";
import {
  insertWorkflowAutomationSchema,
  WORKFLOW_TEMPLATES,
  type WorkflowAutomation,
  type InsertWorkflowAutomation,
} from "@shared/models/workflow-automations";

const router = Router();

// =============================================================================
// STATIC ROUTES (must come BEFORE parameterized routes)
// =============================================================================

/**
 * GET /api/workflow-automations
 * List all workflow automations for the authenticated agent
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const workflows = await storage.getWorkflowAutomationsByAgentId(agentId);
    res.json(workflows);
  } catch (error) {
    console.error("[WorkflowAutomations] Error fetching workflows:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

/**
 * GET /api/workflow-automations/templates
 * Get available workflow templates
 */
router.get("/templates", requireAuth, async (_req, res) => {
  try {
    res.json(WORKFLOW_TEMPLATES);
  } catch (error) {
    console.error("[WorkflowAutomations] Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

/**
 * POST /api/workflow-automations
 * Create a new workflow automation
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;

    const validatedData = insertWorkflowAutomationSchema.parse({
      ...req.body,
      agentId,
    });

    const workflow = await storage.createWorkflowAutomation(validatedData as InsertWorkflowAutomation);

    console.log(`[WorkflowAutomations] Created workflow: ${workflow.name} (${workflow.id})`);

    res.status(201).json(workflow);
  } catch (error: any) {
    if (error.name === "ZodError") {
      console.error("[WorkflowAutomations] Validation error:", fromZodError(error).toString());
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[WorkflowAutomations] Error creating workflow:", error.message || error);
    res.status(500).json({ error: error.message || "Failed to create workflow" });
  }
});

/**
 * POST /api/workflow-automations/from-template
 * Create a workflow from a template
 */
router.post("/from-template", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const { templateId, name, description } = req.body;

    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const workflowData: InsertWorkflowAutomation = {
      agentId,
      name: name || template.name,
      description: description || template.description,
      enabled: false,
      workflow: template.workflow,
    };

    const validatedData = insertWorkflowAutomationSchema.parse(workflowData);
    const workflow = await storage.createWorkflowAutomation(validatedData as InsertWorkflowAutomation);

    console.log(`[WorkflowAutomations] Created from template: ${template.name} -> ${workflow.id}`);

    res.status(201).json(workflow);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[WorkflowAutomations] Error creating from template:", error);
    res.status(500).json({ error: "Failed to create workflow from template" });
  }
});

// =============================================================================
// PARAMETERIZED ROUTES (must come AFTER static routes)
// =============================================================================

/**
 * GET /api/workflow-automations/:id
 * Get a specific workflow by ID
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    const workflow = await storage.getWorkflowAutomationById(id);

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    if (workflow.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(workflow);
  } catch (error) {
    console.error("[WorkflowAutomations] Error fetching workflow:", error);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

/**
 * PUT /api/workflow-automations/:id
 * Update a workflow
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    const existing = await storage.getWorkflowAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await storage.updateWorkflowAutomation(id, {
      ...req.body,
      version: existing.version + 1,
      updatedAt: new Date(),
    });

    console.log(`[WorkflowAutomations] Updated workflow: ${id}`);

    res.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[WorkflowAutomations] Error updating workflow:", error);
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

/**
 * DELETE /api/workflow-automations/:id
 * Delete a workflow
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    const existing = await storage.getWorkflowAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await storage.deleteWorkflowAutomation(id);

    console.log(`[WorkflowAutomations] Deleted workflow: ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error("[WorkflowAutomations] Error deleting workflow:", error);
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

/**
 * PATCH /api/workflow-automations/:id/toggle
 * Enable or disable a workflow
 */
router.patch("/:id/toggle", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const agentId = req.session.userId!;

    const existing = await storage.getWorkflowAutomationById(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (existing.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await storage.updateWorkflowAutomation(id, {
      enabled,
      updatedAt: new Date(),
    });

    console.log(`[WorkflowAutomations] Toggled workflow ${id}: enabled=${enabled}`);

    res.json(updated);
  } catch (error) {
    console.error("[WorkflowAutomations] Error toggling workflow:", error);
    res.status(500).json({ error: "Failed to toggle workflow" });
  }
});

/**
 * POST /api/workflow-automations/:id/test
 * Test run a workflow (dry run - no actual actions executed)
 */
router.post("/:id/test", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;
    const { testData } = req.body;

    const workflow = await storage.getWorkflowAutomationById(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (workflow.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Execute workflow in dry-run mode using testWorkflow (handles type casting)
    const result = await workflowEngine.testWorkflow(id, testData);

    console.log(`[WorkflowAutomations] Test run completed for workflow ${id}: ${result.success ? 'success' : 'failed'}`);

    res.json(result);
  } catch (error: any) {
    console.error("[WorkflowAutomations] Error testing workflow:", error);
    res.status(500).json({ error: error.message || "Failed to test workflow" });
  }
});

/**
 * POST /api/workflow-automations/:id/run
 * Execute a workflow with actual actions
 */
router.post("/:id/run", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;
    const { triggerData } = req.body;

    const workflow = await storage.getWorkflowAutomationById(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (workflow.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Execute workflow with real actions using triggerManually (handles type casting)
    const result = await workflowEngine.triggerManually(id, triggerData);

    console.log(`[WorkflowAutomations] Execution completed for workflow ${id}: ${result.success ? 'success' : 'failed'}`);

    res.json(result);
  } catch (error: any) {
    console.error("[WorkflowAutomations] Error executing workflow:", error);
    res.status(500).json({ error: error.message || "Failed to execute workflow" });
  }
});

/**
 * GET /api/workflow-automations/:id/executions
 * Get execution history for a workflow
 */
router.get("/:id/executions", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.session.userId!;

    const workflow = await storage.getWorkflowAutomationById(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (workflow.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const executions = await storage.getWorkflowExecutionsByWorkflowId(id);

    res.json(executions);
  } catch (error) {
    console.error("[WorkflowAutomations] Error fetching executions:", error);
    res.status(500).json({ error: "Failed to fetch execution history" });
  }
});

export default router;
