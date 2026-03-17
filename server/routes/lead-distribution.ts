/**
 * Lead Distribution API Routes
 * Handles the Executive → Manager → Agent lead distribution pipeline
 */

import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { attachUser, requireAuth, requireRole } from "../middleware/auth";
import { Roles } from "../types/permissions";

const router = Router();

// All routes require authentication
router.use(attachUser);
router.use(requireAuth);

// =============================================================================
// GET /pool — Get leads in the user's undistributed pool
// =============================================================================
router.get("/pool", requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page, limit, search, priority, source, sortBy } = req.query;

    const result = await storage.getLeadPool(userId, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      search: search as string,
      priority: priority as string,
      source: source as string,
      sortBy: sortBy as string,
    });

    res.json({
      leads: result.leads,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 50)),
    });
  } catch (error) {
    console.error("Error fetching lead pool:", error);
    res.status(500).json({ error: "Failed to fetch lead pool" });
  }
});

// =============================================================================
// GET /inbox — Get leads distributed to the user (from above in hierarchy)
// =============================================================================
router.get("/inbox", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page, limit, status, search, sortBy } = req.query;

    const result = await storage.getDistributedInbox(userId, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      status: status as string,
      search: search as string,
      sortBy: sortBy as string,
    });

    res.json({
      leads: result.leads,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 50)),
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

// =============================================================================
// GET /stats — Get distribution statistics for the current user
// =============================================================================
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await storage.getDistributionStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching distribution stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// =============================================================================
// GET /recipients — Get available recipients for distribution (direct reports)
// =============================================================================
router.get("/recipients", requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const reports = await storage.getDirectReports(userId);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    res.status(500).json({ error: "Failed to fetch recipients" });
  }
});

// =============================================================================
// POST /distribute — Distribute leads evenly to direct reports
// =============================================================================
router.post("/distribute", requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { leadIds, all } = req.body;

    // Get recipients (direct reports)
    const recipients = await storage.getDirectReports(userId);
    if (recipients.length === 0) {
      return res.status(400).json({ error: "No direct reports found to distribute leads to" });
    }

    // Get leads to distribute
    let leadsToDistribute: string[];
    if (all) {
      const pool = await storage.getLeadPool(userId, { limit: 10000 });
      leadsToDistribute = pool.leads.map(l => l.id);
    } else if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      leadsToDistribute = leadIds;
    } else {
      return res.status(400).json({ error: "No leads specified. Provide leadIds array or set all: true" });
    }

    if (leadsToDistribute.length === 0) {
      return res.status(400).json({ error: "No leads available in pool to distribute" });
    }

    // Calculate even distribution
    const recipientCount = recipients.length;
    const perRecipient = Math.floor(leadsToDistribute.length / recipientCount);
    const remainder = leadsToDistribute.length % recipientCount;

    // Build assignment map
    const assignments: { recipientId: string; leadIds: string[] }[] = [];
    let leadIndex = 0;

    for (let i = 0; i < recipientCount; i++) {
      const count = perRecipient + (i < remainder ? 1 : 0);
      const recipientLeads = leadsToDistribute.slice(leadIndex, leadIndex + count);
      leadIndex += count;

      if (recipientLeads.length > 0) {
        assignments.push({
          recipientId: recipients[i].id,
          leadIds: recipientLeads,
        });
      }
    }

    // Determine distribution level
    const level = (userRole === 'owner' || userRole === 'system_admin')
      ? 'executive_to_manager'
      : 'manager_to_agent';

    // Execute distribution
    const record = await storage.distributeLeads(assignments, userId, userRole, level);

    res.json({
      success: true,
      distributed: leadsToDistribute.length,
      recipientCount: assignments.length,
      perRecipient,
      remainder,
      distributionId: record.id,
      assignments: record.assignments,
    });
  } catch (error) {
    console.error("Error distributing leads:", error);
    res.status(500).json({ error: "Failed to distribute leads" });
  }
});

// =============================================================================
// POST /assign-single — Manually assign one lead to a specific recipient
// =============================================================================
router.post("/assign-single", requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { leadId, recipientId } = req.body;

    if (!leadId || !recipientId) {
      return res.status(400).json({ error: "leadId and recipientId are required" });
    }

    // Verify the lead exists and is in the user's pool
    const lead = await storage.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    if (lead.assignedTo !== userId) {
      return res.status(403).json({ error: "Lead is not in your pool" });
    }

    const level = (userRole === 'owner' || userRole === 'system_admin')
      ? 'executive_to_manager'
      : 'manager_to_agent';

    const record = await storage.distributeLeads(
      [{ recipientId, leadIds: [leadId] }],
      userId,
      userRole,
      level,
    );

    res.json({
      success: true,
      distributionId: record.id,
    });
  } catch (error) {
    console.error("Error assigning lead:", error);
    res.status(500).json({ error: "Failed to assign lead" });
  }
});

// =============================================================================
// GET /history — Get distribution history for current user
// =============================================================================
router.get("/history", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await storage.getDistributionHistory(userId, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({
      records: result.records,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 20)),
    });
  } catch (error) {
    console.error("Error fetching distribution history:", error);
    res.status(500).json({ error: "Failed to fetch distribution history" });
  }
});

// =============================================================================
// GET /website-leads — Get leads from website quote submissions
// =============================================================================
router.get("/website-leads", requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN), async (req: Request, res: Response) => {
  try {
    const quoteRequests = await storage.getQuoteRequests();
    const now = new Date().toISOString().slice(0, 10);

    const websiteLeads = quoteRequests.map((q: any) => {
      const coverageNum = parseInt(String(q.coverageAmount).replace(/[^0-9]/g, '')) || 0;
      const birthYear = q.birthDate ? new Date(q.birthDate).getFullYear() : null;
      const age = birthYear ? new Date().getFullYear() - birthYear : null;
      const baseScore = Math.min(90, Math.max(30, Math.round(coverageNum / 10000) * 5 + 40));
      const leadScore = age && age >= 30 && age <= 55 ? Math.min(95, baseScore + 10) : baseScore;
      const priority = coverageNum >= 500000 ? 'urgent' : coverageNum >= 250000 ? 'high' : coverageNum >= 100000 ? 'medium' : 'low';
      const importedAt = q.createdAt ? new Date(q.createdAt).toISOString().slice(0, 10) : now;

      return {
        id: `quote-${q.id}`,
        firstName: q.firstName,
        lastName: q.lastName,
        email: q.email,
        phone: q.phone,
        streetAddress: q.streetAddress,
        city: q.city,
        state: q.state,
        zipCode: q.zipCode,
        source: 'website',
        priority,
        product: q.coverageType,
        coverageType: q.coverageType,
        estimatedValue: coverageNum,
        coverageAmountDisplay: q.coverageAmount,
        leadScore,
        scoreTier: leadScore >= 80 ? 'on_fire' : leadScore >= 60 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold',
        status: 'pool',
        distributedTo: null,
        assignedTo: null,
        distributedAt: null,
        assignedAt: null,
        pipelineStage: 'new',
        lastActivity: importedAt,
        nextFollowUp: importedAt,
        notes: '',
        importBatch: 'Website Quoter',
        importedAt,
        birthDate: q.birthDate,
        age,
        heightDisplay: q.height,
        weightDisplay: q.weight,
        medicalBackground: q.medicalBackground,
        quoteRequestId: q.id,
      };
    });

    res.json(websiteLeads);
  } catch (error) {
    console.error("Error fetching website leads:", error);
    res.status(500).json({ error: "Failed to fetch website leads" });
  }
});

export default router;
