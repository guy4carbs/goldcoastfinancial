/**
 * CRM Lounge API Routes
 * Dashboard analytics, pipeline stats, and lead management for the CRM interface
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, attachUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import multer from "multer";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import { convertLeadToClient } from "../services/leadConversionService";

const router = Router();

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

// In-memory store for import sessions (would use Redis in production)
const importSessions: Map<string, {
  sessionId: string;
  headers: string[];
  rows: any[];
  duplicates: any[];
  createdAt: Date;
}> = new Map();

// Apply auth middleware to all routes
router.use(attachUser);
router.use(requireAuth);
router.use(requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT));

// =============================================================================
// CRM DASHBOARD
// =============================================================================

/**
 * GET /api/crm/dashboard
 * Comprehensive dashboard stats for the CRM lounge
 */
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    // 1. Lead counts by status
    const statusCounts = await pool.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM leads
      GROUP BY status
    `);

    const leadsByStatus: Record<string, number> = {
      new: 0,
      contacted: 0,
      quoted: 0,
      follow_up: 0,
      won: 0,
      lost: 0,
    };

    statusCounts.rows.forEach((row: any) => {
      if (row.status in leadsByStatus) {
        leadsByStatus[row.status] = parseInt(row.count);
      }
    });

    const totalLeads = Object.values(leadsByStatus).reduce((a, b) => a + b, 0);

    // 2. Total clients (won leads are converted to clients)
    const clientsCount = leadsByStatus.won;

    // 3. Pipeline value by stage
    const pipelineValue = await pool.query(`
      SELECT
        pipeline_stage,
        SUM(COALESCE(estimated_value, 0)) as total_value,
        COUNT(*) as count
      FROM leads
      WHERE status NOT IN ('won', 'lost')
      GROUP BY pipeline_stage
    `);

    const pipeline: Record<string, { value: number; count: number }> = {};
    let totalPipelineValue = 0;

    pipelineValue.rows.forEach((row: any) => {
      const stage = row.pipeline_stage || 'new';
      pipeline[stage] = {
        value: parseInt(row.total_value) || 0,
        count: parseInt(row.count),
      };
      totalPipelineValue += parseInt(row.total_value) || 0;
    });

    // 4. Conversion rate (won / (total - new))
    const eligibleForConversion = totalLeads - leadsByStatus.new;
    const conversionRate = eligibleForConversion > 0
      ? ((leadsByStatus.won / eligibleForConversion) * 100).toFixed(1)
      : "0";

    // 5. Stale leads (no activity in 7+ days, not won/lost)
    const staleLeads = await pool.query(`
      SELECT
        l.id,
        l.first_name,
        l.last_name,
        l.email,
        l.phone,
        l.status,
        l.assigned_to,
        l.estimated_value,
        l.last_contacted_at,
        l.created_at,
        COALESCE(l.last_contacted_at, l.created_at) as last_activity
      FROM leads l
      WHERE l.status NOT IN ('won', 'lost')
        AND COALESCE(l.last_contacted_at, l.created_at) < NOW() - INTERVAL '7 days'
      ORDER BY COALESCE(l.last_contacted_at, l.created_at) ASC
      LIMIT 20
    `);

    // 6. Source effectiveness
    const sourceEffectiveness = await pool.query(`
      SELECT
        source,
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status = 'won') as won_leads,
        AVG(COALESCE(won_amount, estimated_value, 0)) FILTER (WHERE status = 'won') as avg_value,
        SUM(COALESCE(won_amount, 0)) FILTER (WHERE status = 'won') as total_won_value
      FROM leads
      GROUP BY source
      ORDER BY total_leads DESC
    `);

    const sources = sourceEffectiveness.rows.map((row: any) => {
      const total = parseInt(row.total_leads);
      const won = parseInt(row.won_leads) || 0;
      const conversionPct = total > 0 ? ((won / total) * 100).toFixed(1) : "0";

      return {
        source: row.source || 'unknown',
        totalLeads: total,
        wonLeads: won,
        conversionRate: parseFloat(conversionPct),
        avgValue: parseInt(row.avg_value) || 0,
        totalWonValue: parseInt(row.total_won_value) || 0,
      };
    });

    // 7. Funnel metrics (for visualization)
    const funnelStages = ['new', 'contacted', 'quoted', 'follow_up', 'won'];
    const funnel = funnelStages.map((stage, idx) => {
      const count = leadsByStatus[stage] || 0;
      const prevCount = idx > 0 ? (leadsByStatus[funnelStages[idx - 1]] || 0) : totalLeads;
      const conversionFromPrev = prevCount > 0 ? ((count / prevCount) * 100).toFixed(1) : "0";

      return {
        stage,
        count,
        conversionFromPrevious: parseFloat(conversionFromPrev),
      };
    });

    // 8. Recent activity summary
    const recentActivity = await pool.query(`
      SELECT
        la.type,
        COUNT(*) as count
      FROM lead_activities la
      WHERE la.created_at > NOW() - INTERVAL '7 days'
      GROUP BY la.type
    `);

    const activitySummary: Record<string, number> = {};
    recentActivity.rows.forEach((row: any) => {
      activitySummary[row.type] = parseInt(row.count);
    });

    // 9. Performance metrics (last 30 days)
    const performance = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as leads_this_month,
        COUNT(*) FILTER (WHERE status = 'won' AND won_date > NOW() - INTERVAL '30 days') as won_this_month,
        SUM(won_amount) FILTER (WHERE status = 'won' AND won_date > NOW() - INTERVAL '30 days') as revenue_this_month,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as leads_this_week
      FROM leads
    `);

    const perf = performance.rows[0];

    res.json({
      summary: {
        totalLeads,
        totalClients: clientsCount,
        totalPipelineValue,
        conversionRate: parseFloat(conversionRate as string),
        staleLeadsCount: staleLeads.rows.length,
      },
      leadsByStatus,
      funnel,
      pipeline,
      sources,
      staleLeads: staleLeads.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        assignedTo: row.assigned_to,
        estimatedValue: row.estimated_value,
        lastActivity: row.last_activity,
        daysSinceActivity: Math.floor(
          (Date.now() - new Date(row.last_activity).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
      activitySummary,
      performance: {
        leadsThisMonth: parseInt(perf.leads_this_month) || 0,
        wonThisMonth: parseInt(perf.won_this_month) || 0,
        revenueThisMonth: parseInt(perf.revenue_this_month) || 0,
        leadsThisWeek: parseInt(perf.leads_this_week) || 0,
      },
    });
  } catch (error) {
    console.error("[CRM Dashboard] Error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

/**
 * GET /api/crm/pipeline
 * Kanban board view - leads grouped by pipeline stage
 * Includes: New, Contacted, Qualified, Appointment Set, Quoted, Application, Underwriting, Won, Lost
 */
router.get("/pipeline", async (req: Request, res: Response) => {
  try {
    const { assignedTo, includeClosedStages = 'false' } = req.query;
    const includeClosed = includeClosedStages === 'true';

    let query = `
      SELECT
        l.*,
        (SELECT COUNT(*) FROM lead_activities WHERE lead_id = l.id) as activity_count,
        (
          SELECT created_at FROM lead_activities
          WHERE lead_id = l.id
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_activity_at,
        (
          SELECT type FROM lead_activities
          WHERE lead_id = l.id
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_activity_type,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.avatar_url as agent_avatar
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id::text
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by assignedTo (resolve 'me' to current user)
    if (assignedTo && assignedTo !== 'all') {
      const resolvedId = assignedTo === 'me' ? (req as any).user?.id : assignedTo;
      query += ` AND l.assigned_to = $${paramIndex}`;
      params.push(resolvedId);
      paramIndex++;
    }

    // Exclude won/lost unless requested
    if (!includeClosed) {
      query += ` AND l.status NOT IN ('won', 'lost')`;
    }

    query += ` ORDER BY l.lead_score DESC NULLS LAST, l.estimated_value DESC NULLS LAST, l.created_at DESC`;

    const result = await pool.query(query, params);

    // Pipeline stages with display order and probability weights
    const pipelineStages = [
      { id: 'new', label: 'New', probability: 10 },
      { id: 'contacted', label: 'Contacted', probability: 20 },
      { id: 'qualified', label: 'Qualified', probability: 35 },
      { id: 'appointment_set', label: 'Appointment Set', probability: 50 },
      { id: 'quoted', label: 'Quoted', probability: 65 },
      { id: 'application', label: 'Application', probability: 80 },
      { id: 'underwriting', label: 'Underwriting', probability: 90 },
      { id: 'issued', label: 'Issued', probability: 95 },
      { id: 'placed', label: 'Placed (Won)', probability: 100 },
      { id: 'lost', label: 'Lost', probability: 0 },
    ];

    const grouped: Record<string, any[]> = {};
    const stageTotals: Record<string, { count: number; value: number; weightedValue: number }> = {};

    pipelineStages.forEach(s => {
      grouped[s.id] = [];
      stageTotals[s.id] = { count: 0, value: 0, weightedValue: 0 };
    });

    result.rows.forEach((row: any) => {
      // Map old status-based stages to new pipeline stages if needed
      let stage = row.pipeline_stage || 'new';

      // Handle 'won' status specially
      if (row.status === 'won') {
        stage = 'placed';
      } else if (row.status === 'lost') {
        stage = 'lost';
      }

      if (!grouped[stage]) grouped[stage] = [];

      const stageConfig = pipelineStages.find(s => s.id === stage);
      const probability = stageConfig?.probability || 10;
      const estimatedValue = row.estimated_value || 0;
      const closeProbability = row.close_probability || probability;

      // Calculate days in stage
      const stageEnteredAt = row.updated_at || row.created_at;
      const daysInStage = Math.floor(
        (Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      grouped[stage].push({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        pipelineStage: stage,
        leadScore: row.lead_score || 0,
        scoreTier: row.score_tier || 'cold',
        estimatedValue,
        closeProbability,
        expectedCloseDate: row.expected_close_date,
        source: row.source,
        coverageType: row.coverage_type,
        assignedTo: row.assigned_to,
        assignedAgent: row.agent_first_name ? {
          id: row.assigned_to,
          name: `${row.agent_first_name} ${row.agent_last_name}`,
          avatar: row.agent_avatar,
        } : null,
        nextFollowUp: row.next_follow_up,
        lastContactedAt: row.last_contacted_at,
        lastActivityAt: row.last_activity_at,
        lastActivityType: row.last_activity_type,
        activityCount: parseInt(row.activity_count) || 0,
        daysInStage,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });

      // Update stage totals
      stageTotals[stage].count++;
      stageTotals[stage].value += estimatedValue;
      stageTotals[stage].weightedValue += Math.round(estimatedValue * (closeProbability / 100));
    });

    // Calculate overall totals
    let totalValue = 0;
    let totalWeightedValue = 0;
    let totalLeads = 0;

    Object.values(stageTotals).forEach(totals => {
      totalValue += totals.value;
      totalWeightedValue += totals.weightedValue;
      totalLeads += totals.count;
    });

    res.json({
      stages: pipelineStages.map(s => ({
        ...s,
        leads: grouped[s.id],
        ...stageTotals[s.id],
      })),
      summary: {
        totalLeads,
        totalValue,
        totalWeightedValue,
        avgDealSize: totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0,
      },
    });
  } catch (error) {
    console.error("[CRM Pipeline] Error:", error);
    res.status(500).json({ error: "Failed to load pipeline" });
  }
});

/**
 * PATCH /api/crm/pipeline/:leadId/stage
 * Update lead pipeline stage with activity logging
 */
router.patch("/pipeline/:leadId/stage", async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { newStage, note } = req.body;
    const userId = req.user?.id;

    if (!newStage) {
      return res.status(400).json({ error: "newStage is required" });
    }

    // Valid pipeline stages
    const validStages = ['new', 'contacted', 'qualified', 'appointment_set', 'quoted', 'application', 'underwriting', 'issued', 'placed', 'lost'];
    if (!validStages.includes(newStage)) {
      return res.status(400).json({ error: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
    }

    // Get current lead state
    const currentLead = await pool.query(
      "SELECT pipeline_stage, status, first_name, last_name FROM leads WHERE id = $1",
      [leadId]
    );

    if (currentLead.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const oldStage = currentLead.rows[0].pipeline_stage || 'new';
    const leadName = `${currentLead.rows[0].first_name} ${currentLead.rows[0].last_name}`;

    // Determine if this is a close (won/lost)
    let newStatus = currentLead.rows[0].status;
    let wonDate = null;

    if (newStage === 'placed') {
      newStatus = 'won';
      wonDate = 'NOW()';
    } else if (newStage === 'lost') {
      newStatus = 'lost';
    } else if (['won', 'lost'].includes(currentLead.rows[0].status)) {
      // Reopening a closed lead
      newStatus = 'follow_up';
    }

    // Update the lead
    const updateQuery = newStage === 'placed'
      ? `
        UPDATE leads
        SET pipeline_stage = $1,
            status = $2,
            won_date = NOW(),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `
      : `
        UPDATE leads
        SET pipeline_stage = $1,
            status = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;

    const result = await pool.query(updateQuery, [newStage, newStatus, leadId]);
    const updatedLead = result.rows[0];

    // Log the activity
    const activityDescription = note || `Lead moved from "${oldStage}" to "${newStage}"`;
    await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, old_status, new_status, performed_by)
      VALUES ($1, 'stage_change', 'Pipeline Stage Changed', $2, $3, $4, $5)
    `, [leadId, activityDescription, oldStage, newStage, userId]);

    // Trigger lead-to-client conversion when stage moves to "placed"
    let conversionResult = null;
    if (newStage === 'placed' && userId) {
      try {
        conversionResult = await convertLeadToClient(leadId, userId);
        // Emit POLICY_SOLD event — activates downstream agents (commission, billing, retention, etc.)
        if (conversionResult?.success) {
          try {
            const { EventBus, EventType } = await import('../agents/core/event-bus');
            EventBus.getInstance().emit({
              type: EventType.POLICY_SOLD,
              source: 'crm-pipeline',
              data: {
                leadId,
                agentUserId: userId,
                clientUserId: conversionResult.clientUserId,
                policyId: conversionResult.policyId,
              },
            });
          } catch (eventErr) {
            console.error('[CRM Pipeline] POLICY_SOLD event emission failed:', eventErr);
          }
        }
      } catch (err) {
        console.error('[CRM Pipeline] Lead conversion failed (non-blocking):', err);
      }
    }

    res.json({
      success: true,
      lead: {
        id: updatedLead.id,
        firstName: updatedLead.first_name,
        lastName: updatedLead.last_name,
        pipelineStage: updatedLead.pipeline_stage,
        status: updatedLead.status,
        estimatedValue: updatedLead.estimated_value,
        updatedAt: updatedLead.updated_at,
      },
      transition: {
        from: oldStage,
        to: newStage,
        note: activityDescription,
      },
      conversion: conversionResult,
    });
  } catch (error) {
    console.error("[CRM Pipeline Stage Update] Error:", error);
    res.status(500).json({ error: "Failed to update pipeline stage" });
  }
});

/**
 * GET /api/crm/pipeline/forecast
 * Pipeline value forecast - weighted values, expected closes, projections
 */
router.get("/pipeline/forecast", async (req: Request, res: Response) => {
  try {
    // Stage probability weights
    const stageProbabilities: Record<string, number> = {
      new: 10,
      contacted: 20,
      qualified: 35,
      appointment_set: 50,
      quoted: 65,
      application: 80,
      underwriting: 90,
      issued: 95,
      placed: 100,
      lost: 0,
    };

    // Get pipeline value by stage
    const pipelineByStage = await pool.query(`
      SELECT
        pipeline_stage,
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as total_value,
        AVG(COALESCE(close_probability, 0)) as avg_probability
      FROM leads
      WHERE status NOT IN ('won', 'lost')
      GROUP BY pipeline_stage
      ORDER BY pipeline_stage
    `);

    const stageData = pipelineByStage.rows.map((row: any) => {
      const stage = row.pipeline_stage || 'new';
      const stageProbability = stageProbabilities[stage] || 10;
      const avgProbability = row.avg_probability || stageProbability;
      const totalValue = parseInt(row.total_value) || 0;
      const weightedValue = Math.round(totalValue * (avgProbability / 100));

      return {
        stage,
        count: parseInt(row.count),
        totalValue,
        avgProbability: Math.round(avgProbability),
        weightedValue,
      };
    });

    // Expected closes this week (based on expected_close_date)
    const closesThisWeek = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as value
      FROM leads
      WHERE status NOT IN ('won', 'lost')
        AND expected_close_date >= CURRENT_DATE
        AND expected_close_date < CURRENT_DATE + INTERVAL '7 days'
    `);

    // Expected closes this month
    const closesThisMonth = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as value
      FROM leads
      WHERE status NOT IN ('won', 'lost')
        AND expected_close_date >= CURRENT_DATE
        AND expected_close_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    `);

    // Expected closes next month
    const closesNextMonth = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as value
      FROM leads
      WHERE status NOT IN ('won', 'lost')
        AND expected_close_date >= DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND expected_close_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 months'
    `);

    // Won this month (actual)
    const wonThisMonth = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(COALESCE(won_amount, estimated_value, 0)) as value
      FROM leads
      WHERE status = 'won'
        AND won_date >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Lost this month
    const lostThisMonth = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as lost_value
      FROM leads
      WHERE status = 'lost'
        AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Historical win rate (last 90 days)
    const historicalRate = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'won') as won,
        COUNT(*) FILTER (WHERE status IN ('won', 'lost')) as closed
      FROM leads
      WHERE (status IN ('won', 'lost'))
        AND COALESCE(won_date, updated_at) >= CURRENT_DATE - INTERVAL '90 days'
    `);

    const won = parseInt(historicalRate.rows[0]?.won) || 0;
    const closed = parseInt(historicalRate.rows[0]?.closed) || 1;
    const winRate = Math.round((won / closed) * 100);

    // Calculate totals
    let totalPipelineValue = 0;
    let totalWeightedValue = 0;
    let totalDeals = 0;

    stageData.forEach(stage => {
      totalPipelineValue += stage.totalValue;
      totalWeightedValue += stage.weightedValue;
      totalDeals += stage.count;
    });

    res.json({
      pipeline: {
        totalValue: totalPipelineValue,
        weightedValue: totalWeightedValue,
        totalDeals,
        avgDealSize: totalDeals > 0 ? Math.round(totalPipelineValue / totalDeals) : 0,
        byStage: stageData,
      },
      forecast: {
        thisWeek: {
          expectedDeals: parseInt(closesThisWeek.rows[0]?.count) || 0,
          expectedValue: parseInt(closesThisWeek.rows[0]?.value) || 0,
        },
        thisMonth: {
          expectedDeals: parseInt(closesThisMonth.rows[0]?.count) || 0,
          expectedValue: parseInt(closesThisMonth.rows[0]?.value) || 0,
        },
        nextMonth: {
          expectedDeals: parseInt(closesNextMonth.rows[0]?.count) || 0,
          expectedValue: parseInt(closesNextMonth.rows[0]?.value) || 0,
        },
      },
      actuals: {
        wonThisMonth: {
          deals: parseInt(wonThisMonth.rows[0]?.count) || 0,
          value: parseInt(wonThisMonth.rows[0]?.value) || 0,
        },
        lostThisMonth: {
          deals: parseInt(lostThisMonth.rows[0]?.count) || 0,
          value: parseInt(lostThisMonth.rows[0]?.lost_value) || 0,
        },
      },
      metrics: {
        winRate,
        avgTimeToClose: 0, // Could calculate from won_date - created_at
      },
    });
  } catch (error) {
    console.error("[CRM Pipeline Forecast] Error:", error);
    res.status(500).json({ error: "Failed to load pipeline forecast" });
  }
});

/**
 * GET /api/crm/pipeline/closing-stats
 * Agent-specific closing statistics for the Closing tab
 */
router.get("/pipeline/closing-stats", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const closingStages = ['quoted', 'application', 'underwriting', 'issued'];

    // Deals in closing pipeline
    const pipelineCount = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as total_value,
        SUM(ROUND(COALESCE(estimated_value, 0) * COALESCE(close_probability, 50) / 100.0)) as weighted_value
      FROM leads
      WHERE assigned_to = $1::text
        AND pipeline_stage = ANY($2)
        AND status NOT IN ('won', 'lost')
    `, [userId, closingStages]);

    // Close rate (last 30 days)
    const closeRate = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'won') as won,
        COUNT(*) FILTER (WHERE status IN ('won', 'lost')) as closed
      FROM leads
      WHERE assigned_to = $1::text
        AND COALESCE(won_date, updated_at) >= CURRENT_DATE - INTERVAL '30 days'
        AND status IN ('won', 'lost')
    `, [userId]);

    // Average days to close (won leads, last 90 days)
    const avgDays = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(won_date, updated_at) - created_at)) / 86400)::int as avg_days
      FROM leads
      WHERE assigned_to = $1::text
        AND status = 'won'
        AND won_date >= CURRENT_DATE - INTERVAL '90 days'
    `, [userId]);

    // Revenue this month
    const revenue = await pool.query(`
      SELECT SUM(COALESCE(won_amount, estimated_value, 0)) as value
      FROM leads
      WHERE assigned_to = $1::text
        AND status = 'won'
        AND won_date >= DATE_TRUNC('month', CURRENT_DATE)
    `, [userId]);

    // Post-close workflow counts
    const postClose = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') as complete,
        COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')) as pending
      FROM post_close_workflows
      WHERE agent_user_id = $1::text
    `, [userId]);

    const won = parseInt(closeRate.rows[0]?.won) || 0;
    const closed = parseInt(closeRate.rows[0]?.closed) || 1;

    res.json({
      dealsInPipeline: parseInt(pipelineCount.rows[0]?.count) || 0,
      pipelineValue: parseInt(pipelineCount.rows[0]?.total_value) || 0,
      weightedPipelineValue: parseInt(pipelineCount.rows[0]?.weighted_value) || 0,
      closeRate: Math.round((won / closed) * 100),
      avgDaysToClose: parseInt(avgDays.rows[0]?.avg_days) || 0,
      revenueThisMonth: parseInt(revenue.rows[0]?.value) || 0,
      postCloseComplete: parseInt(postClose.rows[0]?.complete) || 0,
      postClosePending: parseInt(postClose.rows[0]?.pending) || 0,
    });
  } catch (error) {
    console.error("[CRM Closing Stats] Error:", error);
    res.status(500).json({ error: "Failed to load closing stats" });
  }
});

/**
 * GET /api/crm/pipeline/recent-closings
 * Recently placed/won deals for this agent with policy and commission data
 */
router.get("/pipeline/recent-closings", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const result = await pool.query(`
      SELECT
        l.id,
        l.first_name,
        l.last_name,
        l.email,
        l.coverage_type,
        l.estimated_value,
        l.won_amount,
        l.won_date,
        l.converted_user_id,
        p.id as policy_id,
        p.policy_number,
        p.type as policy_type,
        p.coverage_amount as policy_coverage,
        p.monthly_premium,
        p.carrier,
        c.amount as commission_amount,
        c.status as commission_status,
        pcw.status as workflow_status,
        pcw.welcome_email_sent_at,
        pcw.welcome_sms_sent_at,
        pcw.book_of_business_updated_at,
        pcw.details_verified_at
      FROM leads l
      LEFT JOIN policies p ON p.lead_id = l.id::text
      LEFT JOIN commissions c ON c.lead_id = l.id::text AND c.agent_user_id = $1::uuid
      LEFT JOIN post_close_workflows pcw ON pcw.lead_id = l.id::text AND pcw.agent_user_id = $1::text
      WHERE l.assigned_to = $1::text
        AND l.status = 'won'
        AND l.won_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY l.won_date DESC
      LIMIT 20
    `, [userId]);

    const closings = result.rows.map((row: any) => ({
      id: row.id,
      clientName: `${row.first_name} ${row.last_name}`,
      email: row.email,
      coverageType: row.coverage_type,
      estimatedValue: row.estimated_value,
      wonAmount: row.won_amount,
      wonDate: row.won_date,
      convertedUserId: row.converted_user_id,
      policyId: row.policy_id,
      policyNumber: row.policy_number,
      policyType: row.policy_type,
      coverageAmount: parseInt(row.policy_coverage) || row.estimated_value || 0,
      monthlyPremium: parseFloat(row.monthly_premium) || 0,
      carrier: row.carrier || 'Pending',
      commissionEarned: row.commission_amount ? parseFloat(row.commission_amount) : null,
      commissionStatus: row.commission_status,
      workflowStatus: row.workflow_status || null,
      welcomeEmailSent: !!row.welcome_email_sent_at,
      welcomeSmsSent: !!row.welcome_sms_sent_at,
      bookOfBusinessUpdated: !!row.book_of_business_updated_at,
      detailsVerified: !!row.details_verified_at,
    }));

    res.json(closings);
  } catch (error) {
    console.error("[CRM Recent Closings] Error:", error);
    res.status(500).json({ error: "Failed to load recent closings" });
  }
});

/**
 * GET /api/crm/leads/stale
 * Get all stale leads with details
 */
router.get("/leads/stale", async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const staleDays = parseInt(days as string) || 7;

    const result = await pool.query(`
      SELECT
        l.*,
        la.created_at as last_activity_date,
        la.type as last_activity_type
      FROM leads l
      LEFT JOIN LATERAL (
        SELECT created_at, type
        FROM lead_activities
        WHERE lead_id = l.id
        ORDER BY created_at DESC
        LIMIT 1
      ) la ON true
      WHERE l.status NOT IN ('won', 'lost')
        AND COALESCE(la.created_at, l.created_at) < NOW() - INTERVAL '${staleDays} days'
      ORDER BY COALESCE(la.created_at, l.created_at) ASC
    `);

    res.json({
      staleLeads: result.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        pipelineStage: row.pipeline_stage,
        estimatedValue: row.estimated_value,
        assignedTo: row.assigned_to,
        source: row.source,
        lastActivityDate: row.last_activity_date || row.created_at,
        lastActivityType: row.last_activity_type || 'created',
        daysSinceActivity: Math.floor(
          (Date.now() - new Date(row.last_activity_date || row.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        createdAt: row.created_at,
      })),
      total: result.rows.length,
      thresholdDays: staleDays,
    });
  } catch (error) {
    console.error("[CRM Stale Leads] Error:", error);
    res.status(500).json({ error: "Failed to load stale leads" });
  }
});

/**
 * GET /api/crm/analytics/sources
 * Detailed source analytics
 */
router.get("/analytics/sources", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        source,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'won') as won,
        COUNT(*) FILTER (WHERE status = 'lost') as lost,
        COUNT(*) FILTER (WHERE status NOT IN ('won', 'lost')) as active,
        AVG(COALESCE(estimated_value, 0)) as avg_estimated_value,
        AVG(COALESCE(won_amount, 0)) FILTER (WHERE status = 'won') as avg_won_value,
        SUM(COALESCE(won_amount, 0)) FILTER (WHERE status = 'won') as total_won_value,
        AVG(EXTRACT(EPOCH FROM (won_date - created_at)) / 86400) FILTER (WHERE status = 'won') as avg_days_to_close
      FROM leads
      GROUP BY source
      ORDER BY total DESC
    `);

    res.json({
      sources: result.rows.map((row: any) => {
        const total = parseInt(row.total);
        const won = parseInt(row.won) || 0;
        const lost = parseInt(row.lost) || 0;
        const closed = won + lost;

        return {
          source: row.source || 'unknown',
          total,
          won,
          lost,
          active: parseInt(row.active) || 0,
          conversionRate: closed > 0 ? ((won / closed) * 100).toFixed(1) : "0",
          avgEstimatedValue: Math.round(parseFloat(row.avg_estimated_value) || 0),
          avgWonValue: Math.round(parseFloat(row.avg_won_value) || 0),
          totalWonValue: parseInt(row.total_won_value) || 0,
          avgDaysToClose: Math.round(parseFloat(row.avg_days_to_close) || 0),
        };
      }),
    });
  } catch (error) {
    console.error("[CRM Source Analytics] Error:", error);
    res.status(500).json({ error: "Failed to load source analytics" });
  }
});

/**
 * POST /api/crm/leads/:id/touch
 * Quick action to mark lead as contacted
 */
router.post("/leads/:id/touch", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user?.id;

    // Update lead
    await pool.query(`
      UPDATE leads
      SET last_contacted_at = NOW(),
          updated_at = NOW(),
          contact_count = COALESCE(contact_count, 0) + 1
      WHERE id = $1
    `, [id]);

    // Add activity
    await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
      VALUES ($1, 'contact', 'Contacted Lead', $2, $3)
    `, [id, note || 'Marked as contacted', userId]);

    res.json({ success: true });
  } catch (error) {
    console.error("[CRM Touch Lead] Error:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

/**
 * POST /api/crm/leads/:id/advance
 * Move lead to next pipeline stage
 */
router.post("/leads/:id/advance", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStage, note } = req.body;
    const userId = req.user?.id;

    // Get current stage
    const current = await pool.query("SELECT pipeline_stage, status FROM leads WHERE id = $1", [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const oldStage = current.rows[0].pipeline_stage;

    // Update lead
    await pool.query(`
      UPDATE leads
      SET pipeline_stage = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [newStage, id]);

    // Add activity
    await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, old_status, new_status, performed_by)
      VALUES ($1, 'stage_change', 'Pipeline Stage Changed', $2, $3, $4, $5)
    `, [id, note || `Moved from ${oldStage} to ${newStage}`, oldStage, newStage, userId]);

    res.json({ success: true, oldStage, newStage });
  } catch (error) {
    console.error("[CRM Advance Lead] Error:", error);
    res.status(500).json({ error: "Failed to advance lead" });
  }
});

// =============================================================================
// CONTACT DATABASE
// =============================================================================

/**
 * GET /api/crm/contacts
 * Unified contact database - leads + client users
 */
router.get("/contacts", async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      type = 'both', // lead, client, both
      status,
      source,
      assignedTo,
      page = '1',
      limit = '25',
      sort = 'created_desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 25));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic query for leads
    let leadsQuery = `
      SELECT
        l.id,
        l.first_name,
        l.last_name,
        l.email,
        l.phone,
        l.status,
        l.source,
        l.assigned_to,
        l.estimated_value,
        l.pipeline_stage,
        l.lead_score,
        l.last_contacted_at,
        l.created_at,
        l.updated_at,
        'lead' as contact_type,
        (SELECT COUNT(*) FROM lead_activities WHERE lead_id = l.id) as activity_count
      FROM leads l
      WHERE 1=1
    `;

    // Build dynamic query for client users
    let clientsQuery = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        'client' as status,
        'portal' as source,
        NULL as assigned_to,
        NULL as estimated_value,
        NULL as pipeline_stage,
        NULL as lead_score,
        u.last_login_at as last_contacted_at,
        u.created_at,
        u.updated_at,
        'client' as contact_type,
        0 as activity_count
      FROM users u
      WHERE u.role = 'client'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      const searchPattern = `%${search}%`;
      leadsQuery += ` AND (
        l.first_name ILIKE $${paramIndex} OR
        l.last_name ILIKE $${paramIndex} OR
        l.email ILIKE $${paramIndex} OR
        l.phone ILIKE $${paramIndex} OR
        CONCAT(l.first_name, ' ', l.last_name) ILIKE $${paramIndex}
      )`;
      clientsQuery += ` AND (
        u.first_name ILIKE $${paramIndex} OR
        u.last_name ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex} OR
        u.phone ILIKE $${paramIndex} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex}
      )`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Status filter (leads only)
    if (status && status !== 'all') {
      leadsQuery += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Source filter (leads only)
    if (source && source !== 'all') {
      leadsQuery += ` AND l.source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    // Assigned to filter (leads only)
    if (assignedTo && assignedTo !== 'all') {
      leadsQuery += ` AND l.assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }

    // Combine queries based on type
    let combinedQuery: string;
    if (type === 'lead') {
      combinedQuery = leadsQuery;
    } else if (type === 'client') {
      combinedQuery = clientsQuery;
    } else {
      combinedQuery = `(${leadsQuery}) UNION ALL (${clientsQuery})`;
    }

    // Sort
    const sortMap: Record<string, string> = {
      'created_desc': 'created_at DESC',
      'created_asc': 'created_at ASC',
      'name_asc': 'first_name ASC, last_name ASC',
      'name_desc': 'first_name DESC, last_name DESC',
      'value_desc': 'estimated_value DESC NULLS LAST',
      'value_asc': 'estimated_value ASC NULLS LAST',
      'activity_desc': 'last_contacted_at DESC NULLS LAST',
    };
    const orderBy = sortMap[sort as string] || 'created_at DESC';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${combinedQuery}) as combined`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const finalQuery = `
      SELECT * FROM (${combinedQuery}) as combined
      ORDER BY ${orderBy}
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const result = await pool.query(finalQuery, params);

    // Get faceted counts for filters
    const facets = await pool.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM leads
      GROUP BY status
    `);

    const sourceFacets = await pool.query(`
      SELECT
        source,
        COUNT(*) as count
      FROM leads
      GROUP BY source
    `);

    res.json({
      contacts: result.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        source: row.source,
        assignedTo: row.assigned_to,
        estimatedValue: row.estimated_value,
        pipelineStage: row.pipeline_stage,
        leadScore: row.lead_score,
        lastContactedAt: row.last_contacted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        contactType: row.contact_type,
        activityCount: parseInt(row.activity_count) || 0,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      facets: {
        status: facets.rows.reduce((acc: any, row: any) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {}),
        source: sourceFacets.rows.reduce((acc: any, row: any) => {
          acc[row.source || 'unknown'] = parseInt(row.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("[CRM Contacts] Error:", error);
    res.status(500).json({ error: "Failed to load contacts" });
  }
});

/**
 * GET /api/crm/contacts/:id
 * Full contact detail with activities, policies, relationships
 */
router.get("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to find as lead first
    const leadResult = await pool.query(`
      SELECT
        l.*,
        'lead' as contact_type
      FROM leads l
      WHERE l.id = $1
    `, [id]);

    if (leadResult.rows.length > 0) {
      const lead = leadResult.rows[0];

      // Get activities
      const activities = await pool.query(`
        SELECT *
        FROM lead_activities
        WHERE lead_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `, [id]);

      // Get related contacts (same email domain or phone)
      const emailDomain = lead.email?.split('@')[1];
      const relatedResult = await pool.query(`
        SELECT id, first_name, last_name, email, status
        FROM leads
        WHERE id != $1
          AND (
            email LIKE $2
            OR phone = $3
          )
        LIMIT 5
      `, [id, `%@${emailDomain}`, lead.phone]);

      return res.json({
        contact: {
          id: lead.id,
          firstName: lead.first_name,
          lastName: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          streetAddress: lead.street_address,
          city: lead.city,
          state: lead.state,
          zipCode: lead.zip_code,
          status: lead.status,
          source: lead.source,
          priority: lead.priority,
          coverageType: lead.coverage_type,
          coverageAmount: lead.coverage_amount,
          estimatedValue: lead.estimated_value,
          assignedTo: lead.assigned_to,
          nextFollowUp: lead.next_follow_up,
          lastContactedAt: lead.last_contacted_at,
          lostReason: lead.lost_reason,
          wonAmount: lead.won_amount,
          wonDate: lead.won_date,
          notes: lead.notes,
          leadScore: lead.lead_score,
          scoreTier: lead.score_tier,
          pipelineStage: lead.pipeline_stage,
          tags: lead.tags,
          contactCount: lead.contact_count,
          createdAt: lead.created_at,
          updatedAt: lead.updated_at,
          contactType: 'lead',
        },
        activities: activities.rows.map((a: any) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          oldStatus: a.old_status,
          newStatus: a.new_status,
          performedBy: a.performed_by,
          createdAt: a.created_at,
        })),
        relatedContacts: relatedResult.rows.map((r: any) => ({
          id: r.id,
          firstName: r.first_name,
          lastName: r.last_name,
          email: r.email,
          status: r.status,
        })),
        policies: [], // Would come from policies table if linked
      });
    }

    // Try as client user
    const userResult = await pool.query(`
      SELECT u.*, 'client' as contact_type
      FROM users u
      WHERE u.id = $1 AND u.role = 'client'
    `, [id]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];

      // Get policies for this client
      const policies = await pool.query(`
        SELECT *
        FROM policies
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [id]);

      return res.json({
        contact: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          status: 'client',
          source: 'portal',
          contactType: 'client',
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        activities: [],
        relatedContacts: [],
        policies: policies.rows.map((p: any) => ({
          id: p.id,
          policyNumber: p.policy_number,
          type: p.type,
          status: p.status,
          coverageAmount: p.coverage_amount,
          monthlyPremium: p.monthly_premium,
          startDate: p.start_date,
        })),
      });
    }

    res.status(404).json({ error: "Contact not found" });
  } catch (error) {
    console.error("[CRM Contact Detail] Error:", error);
    res.status(500).json({ error: "Failed to load contact" });
  }
});

/**
 * POST /api/crm/contacts/merge
 * Merge duplicate contacts
 */
router.post("/contacts/merge", async (req: Request, res: Response) => {
  try {
    const { primaryId, mergeIds } = req.body;
    const userId = req.user?.id;

    if (!primaryId || !mergeIds || !Array.isArray(mergeIds) || mergeIds.length === 0) {
      return res.status(400).json({ error: "primaryId and mergeIds array required" });
    }

    // Get primary contact
    const primary = await pool.query("SELECT * FROM leads WHERE id = $1", [primaryId]);
    if (primary.rows.length === 0) {
      return res.status(404).json({ error: "Primary contact not found" });
    }

    // Move activities from merged contacts to primary
    for (const mergeId of mergeIds) {
      await pool.query(`
        UPDATE lead_activities
        SET lead_id = $1
        WHERE lead_id = $2
      `, [primaryId, mergeId]);

      // Log the merge
      await pool.query(`
        INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
        VALUES ($1, 'merge', 'Contact Merged', $2, $3)
      `, [primaryId, `Merged contact ${mergeId} into this record`, userId]);

      // Delete merged contact
      await pool.query("DELETE FROM leads WHERE id = $1", [mergeId]);
    }

    // Update primary contact timestamp
    await pool.query("UPDATE leads SET updated_at = NOW() WHERE id = $1", [primaryId]);

    res.json({
      success: true,
      message: `Merged ${mergeIds.length} contact(s) into ${primaryId}`,
      primaryId,
      mergedCount: mergeIds.length,
    });
  } catch (error) {
    console.error("[CRM Merge Contacts] Error:", error);
    res.status(500).json({ error: "Failed to merge contacts" });
  }
});

/**
 * POST /api/crm/contacts/export
 * Export contacts to CSV
 */
router.post("/contacts/export", async (req: Request, res: Response) => {
  try {
    const { ids, type = 'both', filters } = req.body;

    let query = `
      SELECT
        l.first_name,
        l.last_name,
        l.email,
        l.phone,
        l.street_address,
        l.city,
        l.state,
        l.zip_code,
        l.status,
        l.source,
        l.coverage_type,
        l.estimated_value,
        l.assigned_to,
        l.created_at,
        'lead' as type
      FROM leads l
    `;

    const params: any[] = [];

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query += ` WHERE l.id = ANY($1)`;
      params.push(ids);
    } else if (filters) {
      const conditions: string[] = [];
      let paramIndex = 1;

      if (filters.status) {
        conditions.push(`l.status = $${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
      }
      if (filters.source) {
        conditions.push(`l.source = $${paramIndex}`);
        params.push(filters.source);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);

    // Generate CSV
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone',
      'Street Address', 'City', 'State', 'Zip Code',
      'Status', 'Source', 'Coverage Type', 'Estimated Value',
      'Assigned To', 'Created At', 'Type'
    ];

    const csvRows = [headers.join(',')];

    result.rows.forEach((row: any) => {
      const values = [
        row.first_name || '',
        row.last_name || '',
        row.email || '',
        row.phone || '',
        row.street_address || '',
        row.city || '',
        row.state || '',
        row.zip_code || '',
        row.status || '',
        row.source || '',
        row.coverage_type || '',
        row.estimated_value || '',
        row.assigned_to || '',
        row.created_at ? new Date(row.created_at).toISOString() : '',
        row.type || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("[CRM Export Contacts] Error:", error);
    res.status(500).json({ error: "Failed to export contacts" });
  }
});

/**
 * PUT /api/crm/contacts/:id
 * Update a contact
 */
router.put("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    // Build update query dynamically
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone',
      'street_address', 'city', 'state', 'zip_code',
      'status', 'source', 'priority', 'coverage_type',
      'estimated_value', 'assigned_to', 'next_follow_up', 'notes'
    ];

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      streetAddress: 'street_address',
      zipCode: 'zip_code',
      coverageType: 'coverage_type',
      estimatedValue: 'estimated_value',
      assignedTo: 'assigned_to',
      nextFollowUp: 'next_follow_up',
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    setClauses.push('updated_at = NOW()');
    params.push(id);

    const result = await pool.query(`
      UPDATE leads
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Log activity
    await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
      VALUES ($1, 'update', 'Contact Updated', $2, $3)
    `, [id, `Updated fields: ${Object.keys(updates).join(', ')}`, userId]);

    const row = result.rows[0];
    res.json({
      contact: {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        source: row.source,
        estimatedValue: row.estimated_value,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("[CRM Update Contact] Error:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

/**
 * POST /api/crm/contacts/:id/activity
 * Add activity to a contact
 */
router.post("/contacts/:id/activity", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, title, description } = req.body;
    const userId = req.user?.id;

    const result = await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, type, title, description, userId]);

    // Update last contacted if it's a contact activity
    if (['call', 'email', 'meeting', 'contact'].includes(type)) {
      await pool.query(`
        UPDATE leads
        SET last_contacted_at = NOW(),
            contact_count = COALESCE(contact_count, 0) + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [id]);
    }

    const activity = result.rows[0];
    res.json({
      activity: {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        performedBy: activity.performed_by,
        createdAt: activity.created_at,
      },
    });
  } catch (error) {
    console.error("[CRM Add Activity] Error:", error);
    res.status(500).json({ error: "Failed to add activity" });
  }
});

// =============================================================================
// LEAD PROFILE (Full 360° View)
// =============================================================================

/**
 * GET /api/crm/leads/:id/full
 * Complete lead profile with all related data
 */
router.get("/leads/:id/full", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get lead with assigned agent info
    const leadResult = await pool.query(`
      SELECT
        l.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.avatar_url as agent_avatar
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id::text
      WHERE l.id = $1
    `, [id]);

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const lead = leadResult.rows[0];

    // Get activity timeline (last 100)
    const activities = await pool.query(`
      SELECT
        la.*,
        u.first_name as performer_first_name,
        u.last_name as performer_last_name
      FROM lead_activities la
      LEFT JOIN users u ON la.performed_by = u.id::text
      WHERE la.lead_id = $1
      ORDER BY la.created_at DESC
      LIMIT 100
    `, [id]);

    // Get related contacts (same email domain, same phone, or same company)
    const emailDomain = lead.email?.split('@')[1];
    const relatedContacts = await pool.query(`
      SELECT id, first_name, last_name, email, phone, status, pipeline_stage, estimated_value
      FROM leads
      WHERE id != $1
        AND (
          email LIKE $2
          OR phone = $3
        )
      ORDER BY created_at DESC
      LIMIT 10
    `, [id, emailDomain ? `%@${emailDomain}` : '', lead.phone || '']);

    // Get quotes associated with this lead (if table exists)
    let quotes: any[] = [];
    try {
      const quotesResult = await pool.query(`
        SELECT * FROM quotes WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 10
      `, [id]);
      quotes = quotesResult.rows;
    } catch (e) {
      // quotes table may not exist
    }

    // Get appointments (if table exists)
    let appointments: any[] = [];
    try {
      const appointmentsResult = await pool.query(`
        SELECT * FROM appointments WHERE lead_id = $1 ORDER BY scheduled_at DESC LIMIT 10
      `, [id]);
      appointments = appointmentsResult.rows;
    } catch (e) {
      // appointments table may not exist
    }

    // Get applications (if table exists)
    let applications: any[] = [];
    try {
      const applicationsResult = await pool.query(`
        SELECT * FROM applications WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 10
      `, [id]);
      applications = applicationsResult.rows;
    } catch (e) {
      // applications table may not exist
    }

    // Get policies (if converted to client)
    let policies: any[] = [];
    try {
      const policiesResult = await pool.query(`
        SELECT * FROM policies WHERE lead_id = $1 OR email = $2 ORDER BY created_at DESC
      `, [id, lead.email]);
      policies = policiesResult.rows;
    } catch (e) {
      // policies table may not exist or have different structure
    }

    // Communication summary
    const communicationSummary = await pool.query(`
      SELECT
        type,
        COUNT(*) as count,
        MAX(created_at) as last_at
      FROM lead_activities
      WHERE lead_id = $1 AND type IN ('call', 'email', 'sms', 'meeting')
      GROUP BY type
    `, [id]);

    // Build response
    res.json({
      lead: {
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        streetAddress: lead.street_address,
        city: lead.city,
        state: lead.state,
        zipCode: lead.zip_code,
        status: lead.status,
        source: lead.source,
        sourceId: lead.source_id,
        priority: lead.priority,
        coverageType: lead.coverage_type,
        coverageAmount: lead.coverage_amount,
        estimatedValue: lead.estimated_value,
        pipelineStage: lead.pipeline_stage,
        leadScore: lead.lead_score || 0,
        scoreTier: lead.score_tier || 'cold',
        closeProbability: lead.close_probability || 0,
        expectedCloseDate: lead.expected_close_date,
        assignedTo: lead.assigned_to,
        assignedAgent: lead.agent_first_name ? {
          id: lead.assigned_to,
          firstName: lead.agent_first_name,
          lastName: lead.agent_last_name,
          email: lead.agent_email,
          phone: lead.agent_phone,
          avatar: lead.agent_avatar,
        } : null,
        nextFollowUp: lead.next_follow_up,
        lastContactedAt: lead.last_contacted_at,
        contactCount: lead.contact_count || 0,
        lostReason: lead.lost_reason,
        wonAmount: lead.won_amount,
        wonDate: lead.won_date,
        notes: lead.notes,
        tags: lead.tags || [],
        enrichmentData: lead.enrichment_data,
        createdAt: lead.created_at,
        updatedAt: lead.updated_at,
      },
      activities: activities.rows.map((a: any) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        oldStatus: a.old_status,
        newStatus: a.new_status,
        performedBy: a.performed_by,
        performerName: a.performer_first_name
          ? `${a.performer_first_name} ${a.performer_last_name}`
          : null,
        createdAt: a.created_at,
      })),
      communicationSummary: communicationSummary.rows.reduce((acc: any, row: any) => {
        acc[row.type] = {
          count: parseInt(row.count),
          lastAt: row.last_at,
        };
        return acc;
      }, {}),
      relatedContacts: relatedContacts.rows.map((r: any) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        status: r.status,
        pipelineStage: r.pipeline_stage,
        estimatedValue: r.estimated_value,
      })),
      relatedEntities: {
        quotes: quotes.map((q: any) => ({
          id: q.id,
          quoteNumber: q.quote_number,
          coverageType: q.coverage_type,
          coverageAmount: q.coverage_amount,
          monthlyPremium: q.monthly_premium,
          status: q.status,
          createdAt: q.created_at,
        })),
        appointments: appointments.map((a: any) => ({
          id: a.id,
          title: a.title,
          type: a.type,
          scheduledAt: a.scheduled_at,
          status: a.status,
        })),
        applications: applications.map((a: any) => ({
          id: a.id,
          applicationNumber: a.application_number,
          status: a.status,
          submittedAt: a.submitted_at,
        })),
        policies: policies.map((p: any) => ({
          id: p.id,
          policyNumber: p.policy_number,
          type: p.type,
          status: p.status,
          coverageAmount: p.coverage_amount,
          monthlyPremium: p.monthly_premium,
          startDate: p.start_date,
        })),
      },
      aiRecommendations: {
        available: false,
        message: "AI recommendations available in Phase 6",
        suggestions: [],
      },
    });
  } catch (error) {
    console.error("[CRM Lead Full Profile] Error:", error);
    res.status(500).json({ error: "Failed to load lead profile" });
  }
});

/**
 * POST /api/crm/leads/:id/notes
 * Add a note to a lead
 */
router.post("/leads/:id/notes", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isPinned = false } = req.body;
    const userId = req.user?.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

    // Check lead exists
    const leadCheck = await pool.query("SELECT id FROM leads WHERE id = $1", [id]);
    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Add as activity with type 'note'
    const result = await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
      VALUES ($1, 'note', 'Note Added', $2, $3)
      RETURNING *
    `, [id, content, userId]);

    // Update lead's updated_at
    await pool.query("UPDATE leads SET updated_at = NOW() WHERE id = $1", [id]);

    const note = result.rows[0];
    res.json({
      note: {
        id: note.id,
        content: note.description,
        createdBy: note.performed_by,
        createdAt: note.created_at,
        isPinned,
      },
    });
  } catch (error) {
    console.error("[CRM Add Note] Error:", error);
    res.status(500).json({ error: "Failed to add note" });
  }
});

/**
 * POST /api/crm/leads/:id/activity
 * Log an activity for a lead
 */
router.post("/leads/:id/activity", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, title, description, metadata } = req.body;
    const userId = req.user?.id;

    if (!type) {
      return res.status(400).json({ error: "Activity type is required" });
    }

    // Valid activity types
    const validTypes = ['call', 'email', 'sms', 'meeting', 'note', 'task', 'status_change', 'stage_change', 'quote', 'application', 'policy'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid activity type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Check lead exists
    const leadCheck = await pool.query("SELECT id FROM leads WHERE id = $1", [id]);
    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Insert activity
    const result = await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, type, title || `${type.charAt(0).toUpperCase() + type.slice(1)} logged`, description, userId]);

    // Update lead's last_contacted_at for communication activities
    if (['call', 'email', 'sms', 'meeting'].includes(type)) {
      await pool.query(`
        UPDATE leads
        SET last_contacted_at = NOW(),
            contact_count = COALESCE(contact_count, 0) + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [id]);
    } else {
      await pool.query("UPDATE leads SET updated_at = NOW() WHERE id = $1", [id]);
    }

    const activity = result.rows[0];
    res.json({
      activity: {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        performedBy: activity.performed_by,
        createdAt: activity.created_at,
      },
    });
  } catch (error) {
    console.error("[CRM Log Activity] Error:", error);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

/**
 * PATCH /api/crm/leads/:id
 * Update lead fields
 */
router.patch("/leads/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    // Check lead exists
    const leadCheck = await pool.query("SELECT * FROM leads WHERE id = $1", [id]);
    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const currentLead = leadCheck.rows[0];

    // Allowed fields for update
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone',
      'street_address', 'city', 'state', 'zip_code',
      'status', 'source', 'priority', 'coverage_type', 'coverage_amount',
      'estimated_value', 'assigned_to', 'next_follow_up', 'notes',
      'lead_score', 'score_tier', 'close_probability', 'expected_close_date',
      'pipeline_stage', 'tags', 'lost_reason', 'won_amount'
    ];

    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      streetAddress: 'street_address',
      zipCode: 'zip_code',
      coverageType: 'coverage_type',
      coverageAmount: 'coverage_amount',
      estimatedValue: 'estimated_value',
      assignedTo: 'assigned_to',
      nextFollowUp: 'next_follow_up',
      leadScore: 'lead_score',
      scoreTier: 'score_tier',
      closeProbability: 'close_probability',
      expectedCloseDate: 'expected_close_date',
      pipelineStage: 'pipeline_stage',
      lostReason: 'lost_reason',
      wonAmount: 'won_amount',
    };

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    const changedFields: string[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
        changedFields.push(key);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    setClauses.push('updated_at = NOW()');
    params.push(id);

    // Handle special case: marking as won
    if (updates.status === 'won' && currentLead.status !== 'won') {
      setClauses.push('won_date = NOW()');
    }

    const result = await pool.query(`
      UPDATE leads
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    // Log the update as an activity
    const changeDescription = changedFields.map(f => {
      const oldValue = currentLead[fieldMap[f] || f];
      const newValue = updates[f];
      return `${f}: ${oldValue || 'empty'} → ${newValue}`;
    }).join(', ');

    await pool.query(`
      INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
      VALUES ($1, 'update', 'Lead Updated', $2, $3)
    `, [id, changeDescription, userId]);

    // Trigger lead-to-client conversion when status changes to "won"
    let conversionResult = null;
    if (updates.status === 'won' && currentLead.status !== 'won' && userId) {
      try {
        conversionResult = await convertLeadToClient(id, userId);
        if (conversionResult?.success) {
          try {
            const { EventBus, EventType } = await import('../agents/core/event-bus');
            EventBus.getInstance().emit({
              type: EventType.POLICY_SOLD,
              source: 'crm-lead-update',
              data: {
                leadId: id,
                agentUserId: userId,
                clientUserId: conversionResult.clientUserId,
                policyId: conversionResult.policyId,
              },
            });
          } catch (eventErr) {
            console.error('[CRM Update Lead] POLICY_SOLD event emission failed:', eventErr);
          }
        }
      } catch (err) {
        console.error('[CRM Update Lead] Lead conversion failed (non-blocking):', err);
      }
    }

    const lead = result.rows[0];
    res.json({
      lead: {
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        streetAddress: lead.street_address,
        city: lead.city,
        state: lead.state,
        zipCode: lead.zip_code,
        status: lead.status,
        source: lead.source,
        priority: lead.priority,
        coverageType: lead.coverage_type,
        coverageAmount: lead.coverage_amount,
        estimatedValue: lead.estimated_value,
        assignedTo: lead.assigned_to,
        nextFollowUp: lead.next_follow_up,
        lastContactedAt: lead.last_contacted_at,
        notes: lead.notes,
        leadScore: lead.lead_score,
        scoreTier: lead.score_tier,
        closeProbability: lead.close_probability,
        expectedCloseDate: lead.expected_close_date,
        pipelineStage: lead.pipeline_stage,
        tags: lead.tags,
        lostReason: lead.lost_reason,
        wonAmount: lead.won_amount,
        wonDate: lead.won_date,
        createdAt: lead.created_at,
        updatedAt: lead.updated_at,
      },
      changedFields,
      conversion: conversionResult,
    });
  } catch (error) {
    console.error("[CRM Update Lead] Error:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// =============================================================================
// IMPORT/EXPORT CENTER
// =============================================================================

/**
 * POST /api/crm/import/upload
 * Upload CSV/Excel file, parse headers, detect duplicates
 */
router.post("/import/upload", upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let rows: any[] = [];
    let headers: string[] = [];

    // Parse based on file type
    if (file.originalname.endsWith('.csv') || file.mimetype === 'text/csv') {
      // Parse CSV
      const csvText = file.buffer.toString('utf-8');
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
      });
      headers = result.meta.fields || [];
      rows = result.data as any[];
    } else {
      // Parse Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length > 0) {
        headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
        rows = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = row[i] !== undefined ? String(row[i]) : '';
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v !== ''));
      }
    }

    // Detect potential duplicates by email
    const emails = rows
      .map(r => {
        // Try common email field names
        return r.email || r.Email || r.EMAIL || r['Email Address'] || r.email_address || '';
      })
      .filter(e => e && e.includes('@'));

    const duplicates: any[] = [];
    if (emails.length > 0) {
      const existingResult = await pool.query(`
        SELECT id, first_name, last_name, email, phone, status
        FROM leads
        WHERE email = ANY($1)
      `, [emails]);

      duplicates.push(...existingResult.rows.map((r: any) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        status: r.status,
      })));
    }

    // Create import session
    const sessionId = randomUUID();
    importSessions.set(sessionId, {
      sessionId,
      headers,
      rows,
      duplicates,
      createdAt: new Date(),
    });

    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    importSessions.forEach((session, key) => {
      if (session.createdAt < oneHourAgo) {
        importSessions.delete(key);
      }
    });

    // Suggest column mappings
    const suggestedMappings: Record<string, string> = {};
    const fieldPatterns: Record<string, string[]> = {
      fullName: ['full name', 'fullname', 'name', 'client name', 'client', 'insured', 'insured name', 'applicant'],
      firstName: ['first_name', 'firstname', 'first name', 'fname', 'given name', 'first'],
      lastName: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family name', 'last'],
      email: ['email', 'email address', 'e-mail', 'emailaddress', 'e_mail'],
      phone: ['phone', 'phone number', 'telephone', 'mobile', 'cell', 'phonenumber', 'phone_number', 'tel'],
      birthDate: ['birthday', 'birth date', 'birthdate', 'dob', 'date of birth', 'birth_date', 'date_of_birth', 'born'],
      fullAddress: ['full address', 'mailing address', 'address, city, state zip', 'complete address'],
      streetAddress: ['address', 'street', 'street address', 'address1', 'address line 1', 'street_address'],
      city: ['city', 'town'],
      state: ['state', 'province', 'region', 'st'],
      zipCode: ['zip', 'zipcode', 'zip code', 'postal', 'postal code', 'postcode', 'zip_code'],
      source: ['source', 'lead source', 'how heard', 'lead_source'],
      coverageType: ['coverage', 'coverage type', 'product', 'product type', 'insurance type', 'coverage_type', 'type'],
      estimatedValue: ['value', 'estimated value', 'deal value', 'amount', 'estimated_value', 'premium'],
      notes: ['notes', 'comments', 'description', 'note'],
    };

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      for (const [field, patterns] of Object.entries(fieldPatterns)) {
        if (patterns.includes(lowerHeader)) {
          suggestedMappings[header] = field;
          break;
        }
      }
    });

    res.json({
      sessionId,
      fileName: file.originalname,
      fileSize: file.size,
      headers,
      rowCount: rows.length,
      sampleRows: rows.slice(0, 5),
      duplicateCount: duplicates.length,
      duplicates: duplicates.slice(0, 10),
      suggestedMappings,
    });
  } catch (error) {
    console.error("[CRM Import Upload] Error:", error);
    res.status(500).json({ error: "Failed to parse file" });
  }
});

/**
 * POST /api/crm/import/google-sheet
 * Import from a Google Sheets URL (public or shareable link)
 * Extracts the sheet ID, downloads as CSV, and creates an import session
 */
router.post("/import/google-sheet", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Google Sheets URL is required" });

    // Extract sheet ID from various Google Sheets URL formats
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      return res.status(400).json({ error: "Invalid Google Sheets URL. Must be a docs.google.com/spreadsheets link." });
    }
    const sheetId = match[1];

    // Download as CSV (works for publicly shared sheets)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const csvRes = await fetch(csvUrl);

    if (!csvRes.ok) {
      return res.status(400).json({
        error: "Could not access the Google Sheet. Make sure the sheet is shared as 'Anyone with the link can view'."
      });
    }

    const csvText = await csvRes.text();
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    const headers = result.meta.fields || [];
    const rows = result.data as any[];

    if (rows.length === 0) {
      return res.status(400).json({ error: "The Google Sheet appears to be empty" });
    }

    // Detect duplicates by email
    const emails = rows
      .map(r => r.email || r.Email || r.EMAIL || r['Email Address'] || r.email_address || '')
      .filter(e => e && e.includes('@'));

    const duplicates: any[] = [];
    if (emails.length > 0) {
      const existingResult = await pool.query(
        `SELECT id, first_name, last_name, email, phone, status FROM leads WHERE email = ANY($1)`,
        [emails]
      );
      duplicates.push(...existingResult.rows.map((r: any) => ({
        id: r.id, firstName: r.first_name, lastName: r.last_name,
        email: r.email, phone: r.phone, status: r.status,
      })));
    }

    // Create import session (same flow as file upload)
    const sessionId = randomUUID();
    importSessions.set(sessionId, { sessionId, headers, rows, duplicates, createdAt: new Date() });

    // Suggest column mappings
    const suggestedMappings: Record<string, string> = {};
    const fieldPatterns: Record<string, string[]> = {
      fullName: ['full name', 'fullname', 'name', 'client name', 'client', 'insured', 'insured name', 'applicant'],
      firstName: ['first_name', 'firstname', 'first name', 'fname', 'given name', 'first'],
      lastName: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family name', 'last'],
      email: ['email', 'email address', 'e-mail', 'emailaddress', 'e_mail'],
      phone: ['phone', 'phone number', 'telephone', 'mobile', 'cell', 'phonenumber', 'phone_number', 'tel'],
      birthDate: ['birthday', 'birth date', 'birthdate', 'dob', 'date of birth', 'birth_date', 'date_of_birth', 'born'],
      fullAddress: ['full address', 'mailing address', 'address, city, state zip', 'complete address'],
      streetAddress: ['address', 'street', 'street address', 'address1', 'address line 1', 'street_address'],
      city: ['city', 'town'],
      state: ['state', 'province', 'region', 'st'],
      zipCode: ['zip', 'zipcode', 'zip code', 'postal', 'postal code', 'postcode', 'zip_code'],
      source: ['source', 'lead source', 'how heard', 'lead_source'],
      coverageType: ['coverage', 'coverage type', 'product', 'product type', 'insurance type', 'coverage_type', 'type'],
      estimatedValue: ['value', 'estimated value', 'deal value', 'amount', 'estimated_value', 'premium'],
      notes: ['notes', 'comments', 'description', 'note'],
    };

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      for (const [field, patterns] of Object.entries(fieldPatterns)) {
        if (patterns.includes(lowerHeader)) {
          suggestedMappings[header] = field;
          break;
        }
      }
    });

    res.json({
      sessionId,
      fileName: `Google Sheet`,
      fileSize: csvText.length,
      headers,
      rowCount: rows.length,
      sampleRows: rows.slice(0, 5),
      duplicateCount: duplicates.length,
      duplicates: duplicates.slice(0, 10),
      suggestedMappings,
    });
  } catch (error) {
    console.error("[CRM Import Google Sheet] Error:", error);
    res.status(500).json({ error: "Failed to import from Google Sheets" });
  }
});

/**
 * POST /api/crm/import/execute
 * Execute import with column mapping
 */
router.post("/import/execute", async (req: Request, res: Response) => {
  try {
    const { sessionId, columnMapping, skipDuplicates = true, source = 'import' } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !columnMapping) {
      return res.status(400).json({ error: "sessionId and columnMapping required" });
    }

    const session = importSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Import session not found or expired" });
    }

    // Validate required mappings - check if any column maps to required fields
    const mappedFields = Object.values(columnMapping);
    if (!mappedFields.includes('firstName') && !mappedFields.includes('lastName') && !mappedFields.includes('fullName') && !mappedFields.includes('email')) {
      return res.status(400).json({ error: "At least name or email mapping is required" });
    }

    const results = {
      total: session.rows.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as string[],
    };

    // Get existing emails for duplicate check
    const duplicateEmails = new Set(session.duplicates.map((d: any) => d.email?.toLowerCase()));

    // Helper functions for data normalization
    const normalizePhone = (phone: string): string => {
      if (!phone) return '';
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      if (digits.length === 11 && digits.startsWith('1')) {
        return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      }
      return phone;
    };

    const normalizeEmail = (email: string): string => {
      return email?.toLowerCase().trim() || '';
    };

    const normalizeName = (name: string): string => {
      if (!name) return '';
      return name.trim()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    };

    const validateEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Process each row
    for (let i = 0; i < session.rows.length; i++) {
      const row = session.rows[i];
      try {
        // Extract mapped values
        const getValue = (field: string) => {
          const sourceCol = Object.entries(columnMapping).find(([k, v]) => v === field)?.[0];
          return sourceCol ? row[sourceCol] : null;
        };

        // Handle fullName → split into first/last
        let firstName = normalizeName(getValue('firstName') || '');
        let lastName = normalizeName(getValue('lastName') || '');
        const fullName = getValue('fullName') || '';

        // If firstName itself contains a comma, it's probably "Last,First" in a single field
        if (firstName && firstName.includes(',') && !lastName) {
          const parts = firstName.split(',').map((s: string) => s.trim());
          lastName = normalizeName(parts[0] || '');
          firstName = normalizeName(parts[1]?.split(' ')[0] || '');
        }

        // Handle fullName field
        if (fullName && (!firstName || !lastName)) {
          if (fullName.includes(',')) {
            // "Last,First" or "Last, First Middle" format
            const parts = fullName.split(',').map((s: string) => s.trim());
            if (!lastName) lastName = normalizeName(parts[0] || '');
            if (!firstName) firstName = normalizeName(parts[1]?.split(' ')[0] || '');
          } else {
            // "First Last" format
            const parts = fullName.trim().split(/\s+/);
            if (!firstName) firstName = normalizeName(parts[0] || '');
            if (!lastName) lastName = normalizeName(parts.slice(1).join(' ') || '');
          }
        }

        // Final safety: if firstName still has a comma somehow, clean it
        firstName = firstName.replace(/,/g, '').trim();
        lastName = lastName.replace(/,/g, '').trim();

        const email = normalizeEmail(getValue('email') || '');
        const phone = normalizePhone(getValue('phone') || '');

        // Handle birthDate
        const birthDateRaw = getValue('birthDate') || '';
        const birthDate = birthDateRaw ? birthDateRaw.trim() : null;

        // Skip if no identifying info
        if (!email && !firstName && !lastName) {
          results.skipped++;
          continue;
        }

        // Skip duplicates by email
        if (skipDuplicates && email && duplicateEmails.has(email.toLowerCase())) {
          results.skipped++;
          continue;
        }

        // Also check duplicates by phone (if no email)
        if (skipDuplicates && !email && phone) {
          const phoneCheck = await pool.query(`SELECT id FROM leads WHERE phone = $1 LIMIT 1`, [phone]);
          if (phoneCheck.rows.length > 0) {
            results.skipped++;
            continue;
          }
        }

        // Also skip if this exact name+email already imported in this batch
        if (email) {
          duplicateEmails.add(email.toLowerCase());
        }

        // Validate email if provided
        if (email && !validateEmail(email)) {
          results.errors++;
          results.errorDetails.push(`Row ${i + 2}: Invalid email format "${email}"`);
          continue;
        }

        // Handle fullAddress → parse into components
        let streetAddress = getValue('streetAddress') || '';
        let city = getValue('city') || '';
        let state = (getValue('state') || '').toUpperCase().slice(0, 2);
        let zipCode = getValue('zipCode') || '';

        const fullAddress = getValue('fullAddress') || '';
        if (fullAddress && !streetAddress) {
          // Try to parse "1318 Woodbriar Ave, Greensboro, 27405" or "123 Main St, City, ST 12345"
          const addrParts = fullAddress.split(',').map((s: string) => s.trim());
          if (addrParts.length >= 1) streetAddress = addrParts[0];
          if (addrParts.length >= 2) city = addrParts[1];
          // Last part might be "ST 12345" or just "12345"
          if (addrParts.length >= 3) {
            const lastPart = addrParts[addrParts.length - 1].trim();
            const stateZipMatch = lastPart.match(/^([A-Za-z]{2})\s*(\d{5})/);
            if (stateZipMatch) {
              state = stateZipMatch[1].toUpperCase();
              zipCode = stateZipMatch[2];
            } else if (/^\d{5}/.test(lastPart)) {
              zipCode = lastPart.match(/\d{5}/)?.[0] || '';
            } else if (lastPart.length === 2) {
              state = lastPart.toUpperCase();
            }
          }
        }

        const coverageType = getValue('coverageType')?.toLowerCase().replace(/\s+/g, '_') || null;
        const estimatedValue = parseInt(getValue('estimatedValue')) || null;
        const notesVal = getValue('notes') || null;
        const birthdayNote = birthDate ? `DOB: ${birthDate}` : null;
        const notes = [notesVal, birthdayNote].filter(Boolean).join(' | ') || null;
        const importSource = getValue('source') || source;

        // Insert lead — assigned to the importing agent
        await pool.query(`
          INSERT INTO leads (
            first_name, last_name, email, phone,
            street_address, city, state, zip_code,
            source, coverage_type, estimated_value, notes,
            status, pipeline_stage, priority,
            assigned_to, distributed_to, distributed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'new', 'new', 'medium', $13, $13, NOW())
        `, [
          firstName || 'Unknown',
          lastName || '',
          email || null,
          phone || null,
          streetAddress || null,
          city || null,
          state || null,
          zipCode || null,
          importSource,
          coverageType,
          estimatedValue,
          notes,
          userId || null,
        ]);

        results.imported++;
      } catch (err: any) {
        results.errors++;
        results.errorDetails.push(`Row ${i + 2}: ${err.message || 'Unknown error'}`);
      }
    }

    // Log import to history
    await pool.query(`
      INSERT INTO import_history (
        user_id, file_name, total_rows, imported_rows, skipped_rows, error_rows, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      'imported_file', // Would store actual filename
      results.total,
      results.imported,
      results.skipped,
      results.errors,
      source,
    ]).catch(() => {
      // Table might not exist, that's ok
    });

    // Clean up session
    importSessions.delete(sessionId);

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[CRM Import Execute] Error:", error);
    res.status(500).json({ error: "Failed to execute import" });
  }
});

/**
 * GET /api/crm/import/history
 * Get past imports
 */
router.get("/import/history", async (req: Request, res: Response) => {
  try {
    // Try to get from import_history table
    let history: any[] = [];

    try {
      const result = await pool.query(`
        SELECT
          ih.*,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM import_history ih
        LEFT JOIN users u ON ih.user_id = u.id::text
        ORDER BY ih.created_at DESC
        LIMIT 50
      `);
      history = result.rows.map((r: any) => ({
        id: r.id,
        fileName: r.file_name,
        totalRows: r.total_rows,
        importedRows: r.imported_rows,
        skippedRows: r.skipped_rows,
        errorRows: r.error_rows,
        source: r.source,
        userId: r.user_id,
        userName: r.user_first_name ? `${r.user_first_name} ${r.user_last_name}` : 'Unknown',
        createdAt: r.created_at,
      }));
    } catch (e) {
      // Table doesn't exist, return empty
    }

    res.json({ history });
  } catch (error) {
    console.error("[CRM Import History] Error:", error);
    res.status(500).json({ error: "Failed to load import history" });
  }
});

/**
 * POST /api/crm/export
 * Export leads/contacts to CSV or Excel
 */
router.post("/export", async (req: Request, res: Response) => {
  try {
    const {
      type = 'leads', // leads, clients, activities
      format = 'csv', // csv, xlsx
      filters = {},
      fields = [], // Specific fields to export, empty = all
    } = req.body;

    let data: any[] = [];
    let headers: string[] = [];

    if (type === 'leads') {
      // Build query with filters
      let query = `
        SELECT
          l.first_name, l.last_name, l.email, l.phone,
          l.street_address, l.city, l.state, l.zip_code,
          l.status, l.source, l.priority, l.coverage_type,
          l.estimated_value, l.pipeline_stage, l.lead_score,
          l.last_contacted_at, l.created_at
        FROM leads l
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.status) {
        query += ` AND l.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }
      if (filters.source) {
        query += ` AND l.source = $${paramIndex}`;
        params.push(filters.source);
        paramIndex++;
      }
      if (filters.pipelineStage) {
        query += ` AND l.pipeline_stage = $${paramIndex}`;
        params.push(filters.pipelineStage);
        paramIndex++;
      }
      if (filters.dateFrom) {
        query += ` AND l.created_at >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }
      if (filters.dateTo) {
        query += ` AND l.created_at <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      query += ` ORDER BY l.created_at DESC`;

      const result = await pool.query(query, params);

      headers = [
        'First Name', 'Last Name', 'Email', 'Phone',
        'Street Address', 'City', 'State', 'Zip Code',
        'Status', 'Source', 'Priority', 'Coverage Type',
        'Estimated Value', 'Pipeline Stage', 'Lead Score',
        'Last Contacted', 'Created At'
      ];

      data = result.rows.map((r: any) => [
        r.first_name || '',
        r.last_name || '',
        r.email || '',
        r.phone || '',
        r.street_address || '',
        r.city || '',
        r.state || '',
        r.zip_code || '',
        r.status || '',
        r.source || '',
        r.priority || '',
        r.coverage_type || '',
        r.estimated_value || '',
        r.pipeline_stage || '',
        r.lead_score || '',
        r.last_contacted_at ? new Date(r.last_contacted_at).toISOString() : '',
        r.created_at ? new Date(r.created_at).toISOString() : '',
      ]);
    } else if (type === 'activities') {
      const result = await pool.query(`
        SELECT
          l.first_name, l.last_name, l.email,
          la.type, la.title, la.description, la.created_at
        FROM lead_activities la
        JOIN leads l ON la.lead_id = l.id
        ORDER BY la.created_at DESC
        LIMIT 10000
      `);

      headers = ['Lead First Name', 'Lead Last Name', 'Lead Email', 'Activity Type', 'Title', 'Description', 'Date'];
      data = result.rows.map((r: any) => [
        r.first_name || '',
        r.last_name || '',
        r.email || '',
        r.type || '',
        r.title || '',
        r.description || '',
        r.created_at ? new Date(r.created_at).toISOString() : '',
      ]);
    }

    // Generate output based on format
    if (format === 'xlsx') {
      // Generate Excel
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="crm-export-${Date.now()}.xlsx"`);
      res.send(buffer);
    } else {
      // Generate CSV
      const csvRows = [
        headers.join(','),
        ...data.map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
      ];
      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="crm-export-${Date.now()}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error("[CRM Export] Error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// =============================================================================
// CLIENT MANAGEMENT
// =============================================================================

/**
 * GET /api/crm/clients
 * List all clients (users with policies) with policy summary
 */
router.get("/clients", async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      status = 'all',
      sort = 'name_asc',
      page = '1',
      limit = '25',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 25));
    const offset = (pageNum - 1) * limitNum;

    // Build query for clients with policies
    let query = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.created_at,
        u.last_login_at,
        COUNT(DISTINCT p.id) as policy_count,
        SUM(p.coverage_amount) as total_coverage,
        SUM(p.monthly_premium::numeric) as total_monthly_premium,
        MIN(p.next_payment_date) as next_renewal_date,
        MAX(p.start_date) as latest_policy_date,
        ARRAY_AGG(DISTINCT p.type) FILTER (WHERE p.type IS NOT NULL) as policy_types,
        COALESCE(
          (SELECT MAX(created_at) FROM messages WHERE user_id = u.id),
          u.created_at
        ) as last_contact
      FROM users u
      LEFT JOIN policies p ON p.user_id = u.id AND p.status = 'active'
      WHERE u.role = 'client'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (
        u.first_name ILIKE $${paramIndex} OR
        u.last_name ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex} OR
        u.phone ILIKE $${paramIndex} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Policy status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query += ` AND EXISTS (SELECT 1 FROM policies WHERE user_id = u.id AND status = 'active')`;
      } else if (status === 'expiring') {
        query += ` AND EXISTS (SELECT 1 FROM policies WHERE user_id = u.id AND next_payment_date < NOW() + INTERVAL '30 days' AND status = 'active')`;
      } else if (status === 'inactive') {
        query += ` AND NOT EXISTS (SELECT 1 FROM policies WHERE user_id = u.id AND status = 'active')`;
      }
    }

    query += ` GROUP BY u.id`;

    // Sort
    const sortMap: Record<string, string> = {
      'name_asc': 'u.first_name ASC, u.last_name ASC',
      'name_desc': 'u.first_name DESC, u.last_name DESC',
      'created_desc': 'u.created_at DESC',
      'created_asc': 'u.created_at ASC',
      'coverage_desc': 'total_coverage DESC NULLS LAST',
      'premium_desc': 'total_monthly_premium DESC NULLS LAST',
      'renewal_asc': 'next_renewal_date ASC NULLS LAST',
    };
    const orderBy = sortMap[sort as string] || 'u.first_name ASC, u.last_name ASC';
    query += ` ORDER BY ${orderBy}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      WHERE u.role = 'client'
      ${search ? `AND (
        u.first_name ILIKE $1 OR
        u.last_name ILIKE $1 OR
        u.email ILIKE $1 OR
        u.phone ILIKE $1 OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
      )` : ''}
    `;
    const countResult = await pool.query(countQuery, search ? [`%${search}%`] : []);
    const total = parseInt(countResult.rows[0]?.total) || 0;

    // Get paginated results
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;
    const result = await pool.query(query, params);

    // Calculate summary stats
    const summaryQuery = await pool.query(`
      SELECT
        COUNT(DISTINCT u.id) as total_clients,
        COUNT(DISTINCT p.id) as total_policies,
        SUM(p.coverage_amount) as total_coverage,
        SUM(p.monthly_premium::numeric) as total_premium,
        COUNT(DISTINCT CASE WHEN p.next_payment_date < NOW() + INTERVAL '30 days' THEN u.id END) as renewals_30_days
      FROM users u
      LEFT JOIN policies p ON p.user_id = u.id AND p.status = 'active'
      WHERE u.role = 'client'
    `);
    const summary = summaryQuery.rows[0];

    res.json({
      clients: result.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        policyCount: parseInt(row.policy_count) || 0,
        totalCoverage: parseInt(row.total_coverage) || 0,
        totalMonthlyPremium: parseFloat(row.total_monthly_premium) || 0,
        nextRenewalDate: row.next_renewal_date,
        lastContact: row.last_contact,
        policyTypes: row.policy_types || [],
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      summary: {
        totalClients: parseInt(summary.total_clients) || 0,
        totalPolicies: parseInt(summary.total_policies) || 0,
        totalCoverage: parseInt(summary.total_coverage) || 0,
        totalMonthlyPremium: parseFloat(summary.total_premium) || 0,
        renewalsNext30Days: parseInt(summary.renewals_30_days) || 0,
      },
    });
  } catch (error) {
    console.error("[CRM Clients] Error:", error);
    res.status(500).json({ error: "Failed to load clients" });
  }
});

/**
 * GET /api/crm/clients/renewals
 * Get upcoming policy renewals
 */
router.get("/clients/renewals", async (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string) || 30;

    // Get policies with upcoming renewals
    const result = await pool.query(`
      SELECT
        p.id as policy_id,
        p.policy_number,
        p.type as policy_type,
        p.status,
        p.coverage_amount,
        p.monthly_premium,
        p.next_payment_date,
        p.start_date,
        u.id as client_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        EXTRACT(DAYS FROM (p.next_payment_date - NOW())) as days_until_renewal
      FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active'
        AND p.next_payment_date IS NOT NULL
        AND p.next_payment_date <= NOW() + INTERVAL '${daysNum} days'
        AND p.next_payment_date >= NOW()
      ORDER BY p.next_payment_date ASC
    `);

    // Group by urgency
    const urgent: any[] = []; // < 7 days
    const soon: any[] = []; // 7-14 days
    const upcoming: any[] = []; // 14+ days

    result.rows.forEach((row: any) => {
      const daysUntil = parseInt(row.days_until_renewal) || 0;
      const renewal = {
        policyId: row.policy_id,
        policyNumber: row.policy_number,
        policyType: row.policy_type,
        coverageAmount: row.coverage_amount,
        monthlyPremium: parseFloat(row.monthly_premium),
        renewalDate: row.next_payment_date,
        daysUntilRenewal: daysUntil,
        client: {
          id: row.client_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
        },
      };

      if (daysUntil <= 7) {
        urgent.push(renewal);
      } else if (daysUntil <= 14) {
        soon.push(renewal);
      } else {
        upcoming.push(renewal);
      }
    });

    // Get renewal summary stats
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE p.next_payment_date <= NOW() + INTERVAL '7 days') as urgent_count,
        COUNT(*) FILTER (WHERE p.next_payment_date > NOW() + INTERVAL '7 days' AND p.next_payment_date <= NOW() + INTERVAL '14 days') as soon_count,
        COUNT(*) FILTER (WHERE p.next_payment_date > NOW() + INTERVAL '14 days' AND p.next_payment_date <= NOW() + INTERVAL '30 days') as upcoming_count,
        COUNT(*) FILTER (WHERE p.next_payment_date <= NOW() + INTERVAL '30 days') as total_30_days,
        COUNT(*) FILTER (WHERE p.next_payment_date <= NOW() + INTERVAL '60 days') as total_60_days,
        COUNT(*) FILTER (WHERE p.next_payment_date <= NOW() + INTERVAL '90 days') as total_90_days,
        SUM(p.monthly_premium::numeric) FILTER (WHERE p.next_payment_date <= NOW() + INTERVAL '30 days') as revenue_at_risk_30
      FROM policies p
      WHERE p.status = 'active'
        AND p.next_payment_date IS NOT NULL
        AND p.next_payment_date >= NOW()
    `);
    const stats = statsResult.rows[0];

    res.json({
      renewals: {
        urgent,
        soon,
        upcoming,
      },
      summary: {
        urgentCount: parseInt(stats.urgent_count) || 0,
        soonCount: parseInt(stats.soon_count) || 0,
        upcomingCount: parseInt(stats.upcoming_count) || 0,
        total30Days: parseInt(stats.total_30_days) || 0,
        total60Days: parseInt(stats.total_60_days) || 0,
        total90Days: parseInt(stats.total_90_days) || 0,
        revenueAtRisk30Days: parseFloat(stats.revenue_at_risk_30) || 0,
      },
    });
  } catch (error) {
    console.error("[CRM Client Renewals] Error:", error);
    res.status(500).json({ error: "Failed to load renewals" });
  }
});

/**
 * GET /api/crm/clients/:id
 * Full client detail with policies, billing, communications
 */
router.get("/clients/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get client info
    const clientResult = await pool.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.timezone,
        u.avatar_url,
        u.created_at,
        u.last_login_at,
        u.updated_at
      FROM users u
      WHERE u.id = $1 AND u.role = 'client'
    `, [id]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    const client = clientResult.rows[0];

    // Get all policies
    const policiesResult = await pool.query(`
      SELECT
        p.*,
        (
          SELECT COUNT(*) FROM billing_history bh WHERE bh.policy_id = p.id
        ) as payment_count,
        (
          SELECT MAX(payment_date) FROM billing_history bh WHERE bh.policy_id = p.id
        ) as last_payment_date
      FROM policies p
      WHERE p.user_id = $1
      ORDER BY p.start_date DESC
    `, [id]);

    // Get billing history
    const billingResult = await pool.query(`
      SELECT
        bh.*,
        p.policy_number
      FROM billing_history bh
      JOIN policies p ON bh.policy_id = p.id
      WHERE bh.user_id = $1
      ORDER BY bh.payment_date DESC
      LIMIT 50
    `, [id]);

    // Get messages/communications
    const messagesResult = await pool.query(`
      SELECT *
      FROM messages
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    // Get documents
    const documentsResult = await pool.query(`
      SELECT
        d.*,
        p.policy_number
      FROM documents d
      LEFT JOIN policies p ON d.policy_id = p.id
      WHERE d.user_id = $1
      ORDER BY d.uploaded_at DESC
    `, [id]);

    // Get notifications
    const notificationsResult = await pool.query(`
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [id]);

    // Calculate client metrics
    const activePolicies = policiesResult.rows.filter((p: any) => p.status === 'active');
    const totalCoverage = activePolicies.reduce((sum: number, p: any) => sum + (parseInt(p.coverage_amount) || 0), 0);
    const totalMonthlyPremium = activePolicies.reduce((sum: number, p: any) => sum + (parseFloat(p.monthly_premium) || 0), 0);
    const totalPayments = billingResult.rows.reduce((sum: number, b: any) => sum + (parseFloat(b.amount) || 0), 0);

    // Get upsell opportunities (clients with only one policy type or low coverage)
    const upsellOpportunities: any[] = [];
    const policyTypes = new Set(activePolicies.map((p: any) => p.type));

    if (!policyTypes.has('whole_life') && !policyTypes.has('iul')) {
      upsellOpportunities.push({
        type: 'product_expansion',
        title: 'Whole Life or IUL',
        description: 'Client only has term coverage. Consider permanent life insurance options.',
        priority: 'medium',
      });
    }

    if (totalCoverage < 500000) {
      upsellOpportunities.push({
        type: 'coverage_increase',
        title: 'Increase Coverage',
        description: `Current coverage of $${totalCoverage.toLocaleString()} may be insufficient. Recommend coverage review.`,
        priority: 'high',
      });
    }

    if (activePolicies.length === 1) {
      upsellOpportunities.push({
        type: 'additional_policy',
        title: 'Additional Policy',
        description: 'Client has single policy. Consider supplemental coverage.',
        priority: 'low',
      });
    }

    res.json({
      client: {
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        timezone: client.timezone,
        avatarUrl: client.avatar_url,
        createdAt: client.created_at,
        lastLoginAt: client.last_login_at,
        updatedAt: client.updated_at,
      },
      policies: policiesResult.rows.map((p: any) => ({
        id: p.id,
        policyNumber: p.policy_number,
        type: p.type,
        status: p.status,
        coverageAmount: parseInt(p.coverage_amount) || 0,
        monthlyPremium: parseFloat(p.monthly_premium) || 0,
        startDate: p.start_date,
        nextPaymentDate: p.next_payment_date,
        beneficiaryName: p.beneficiary_name,
        beneficiaryRelationship: p.beneficiary_relationship,
        paymentCount: parseInt(p.payment_count) || 0,
        lastPaymentDate: p.last_payment_date,
        createdAt: p.created_at,
      })),
      billing: billingResult.rows.map((b: any) => ({
        id: b.id,
        policyNumber: b.policy_number,
        amount: parseFloat(b.amount) || 0,
        status: b.status,
        paymentDate: b.payment_date,
        paymentMethod: b.payment_method,
        transactionId: b.transaction_id,
        createdAt: b.created_at,
      })),
      communications: messagesResult.rows.map((m: any) => ({
        id: m.id,
        fromName: m.from_name,
        fromEmail: m.from_email,
        subject: m.subject,
        content: m.content,
        isRead: m.is_read,
        isFromClient: m.is_from_client,
        priority: m.priority,
        createdAt: m.created_at,
      })),
      documents: documentsResult.rows.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        category: d.category,
        fileSize: d.file_size,
        policyNumber: d.policy_number,
        uploadedAt: d.uploaded_at,
      })),
      notifications: notificationsResult.rows.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        actionUrl: n.action_url,
        createdAt: n.created_at,
      })),
      metrics: {
        totalPolicies: policiesResult.rows.length,
        activePolicies: activePolicies.length,
        totalCoverage,
        totalMonthlyPremium,
        annualPremium: totalMonthlyPremium * 12,
        lifetimeValue: totalPayments,
        memberSince: client.created_at,
        policyTypes: Array.from(policyTypes),
      },
      upsellOpportunities,
    });
  } catch (error) {
    console.error("[CRM Client Detail] Error:", error);
    res.status(500).json({ error: "Failed to load client details" });
  }
});

/**
 * POST /api/crm/clients/:id/note
 * Add a note/communication to client record
 */
router.post("/clients/:id/note", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, content, priority = 'normal' } = req.body;
    const userId = req.user?.id;
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'System';

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Add as a message (internal note)
    const result = await pool.query(`
      INSERT INTO messages (user_id, from_name, from_email, subject, content, is_from_client, priority)
      VALUES ($1, $2, $3, $4, $5, false, $6)
      RETURNING *
    `, [id, userName, req.user?.email, subject || 'Note', content, priority]);

    const message = result.rows[0];
    res.json({
      note: {
        id: message.id,
        subject: message.subject,
        content: message.content,
        fromName: message.from_name,
        priority: message.priority,
        createdAt: message.created_at,
      },
    });
  } catch (error) {
    console.error("[CRM Client Note] Error:", error);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// =============================================================================
// SEGMENTS & TAGS
// =============================================================================

/**
 * GET /api/crm/tags
 * Get all unique tags used across leads
 */
router.get("/tags", async (req: Request, res: Response) => {
  try {
    // Get all unique tags with counts
    const result = await pool.query(`
      SELECT
        unnest(tags) as tag,
        COUNT(*) as count
      FROM leads
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      GROUP BY unnest(tags)
      ORDER BY count DESC, tag ASC
    `);

    // Get leads without tags
    const untaggedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE tags IS NULL OR array_length(tags, 1) = 0 OR tags = '{}'
    `);

    res.json({
      tags: result.rows.map((row: any) => ({
        name: row.tag,
        count: parseInt(row.count),
      })),
      untaggedCount: parseInt(untaggedResult.rows[0]?.count) || 0,
    });
  } catch (error) {
    console.error("[CRM Tags] Error:", error);
    res.status(500).json({ error: "Failed to load tags" });
  }
});

/**
 * POST /api/crm/tags
 * Create/add a tag (just adds to a lead)
 */
router.post("/tags", async (req: Request, res: Response) => {
  try {
    const { leadIds, tag } = req.body;

    if (!tag || !leadIds || !Array.isArray(leadIds)) {
      return res.status(400).json({ error: "tag and leadIds array required" });
    }

    const cleanTag = tag.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    // Add tag to all specified leads
    await pool.query(`
      UPDATE leads
      SET tags = array_append(
        COALESCE(tags, ARRAY[]::text[]),
        $1
      ),
      updated_at = NOW()
      WHERE id = ANY($2)
        AND NOT ($1 = ANY(COALESCE(tags, ARRAY[]::text[])))
    `, [cleanTag, leadIds]);

    res.json({ success: true, tag: cleanTag, appliedTo: leadIds.length });
  } catch (error) {
    console.error("[CRM Add Tag] Error:", error);
    res.status(500).json({ error: "Failed to add tag" });
  }
});

/**
 * DELETE /api/crm/tags/:tag
 * Remove a tag from leads
 */
router.delete("/tags/:tag", async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const { leadIds } = req.body; // Optional - if not provided, remove from all

    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      // Remove from specific leads
      await pool.query(`
        UPDATE leads
        SET tags = array_remove(tags, $1),
            updated_at = NOW()
        WHERE id = ANY($2)
      `, [tag, leadIds]);
    } else {
      // Remove from all leads
      await pool.query(`
        UPDATE leads
        SET tags = array_remove(tags, $1),
            updated_at = NOW()
        WHERE $1 = ANY(tags)
      `, [tag]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[CRM Remove Tag] Error:", error);
    res.status(500).json({ error: "Failed to remove tag" });
  }
});

/**
 * GET /api/crm/segments
 * Get saved segments (filter presets)
 */
router.get("/segments", async (req: Request, res: Response) => {
  try {
    // Check if segments table exists, if not return defaults
    let segments: any[] = [];

    try {
      const result = await pool.query(`
        SELECT * FROM crm_segments
        ORDER BY is_system DESC, name ASC
      `);
      segments = result.rows;
    } catch (e) {
      // Table doesn't exist, return default segments
    }

    // Add dynamic/calculated segments
    const dynamicSegments = [
      {
        id: 'hot-leads',
        name: 'Hot Leads',
        description: 'Leads with score 80+ or score_tier = hot/on_fire',
        icon: 'flame',
        color: 'red',
        isSystem: true,
        filters: { scoreTier: ['hot', 'on_fire'] },
      },
      {
        id: 'stale-leads',
        name: 'Stale Leads',
        description: 'No activity in 7+ days',
        icon: 'clock',
        color: 'amber',
        isSystem: true,
        filters: { staleDays: 7 },
      },
      {
        id: 'high-value',
        name: 'High Value',
        description: 'Estimated value $500k+',
        icon: 'dollar-sign',
        color: 'green',
        isSystem: true,
        filters: { minValue: 500000 },
      },
      {
        id: 'needs-followup',
        name: 'Needs Follow-up',
        description: 'Follow-up date is today or past',
        icon: 'bell',
        color: 'blue',
        isSystem: true,
        filters: { followUpDue: true },
      },
      {
        id: 'unassigned',
        name: 'Unassigned',
        description: 'Leads without an assigned agent',
        icon: 'user-x',
        color: 'gray',
        isSystem: true,
        filters: { unassigned: true },
      },
      {
        id: 'new-this-week',
        name: 'New This Week',
        description: 'Created in the last 7 days',
        icon: 'sparkles',
        color: 'violet',
        isSystem: true,
        filters: { createdDays: 7 },
      },
    ];

    // Get counts for each segment
    const countsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE score_tier IN ('hot', 'on_fire') OR lead_score >= 80) as hot_leads,
        COUNT(*) FILTER (WHERE
          status NOT IN ('won', 'lost') AND
          COALESCE(last_contacted_at, created_at) < NOW() - INTERVAL '7 days'
        ) as stale_leads,
        COUNT(*) FILTER (WHERE estimated_value >= 500000) as high_value,
        COUNT(*) FILTER (WHERE
          next_follow_up IS NOT NULL AND
          next_follow_up <= NOW() AND
          status NOT IN ('won', 'lost')
        ) as needs_followup,
        COUNT(*) FILTER (WHERE assigned_to IS NULL AND status NOT IN ('won', 'lost')) as unassigned,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_this_week
      FROM leads
    `);

    const counts = countsResult.rows[0];
    const countMap: Record<string, number> = {
      'hot-leads': parseInt(counts.hot_leads) || 0,
      'stale-leads': parseInt(counts.stale_leads) || 0,
      'high-value': parseInt(counts.high_value) || 0,
      'needs-followup': parseInt(counts.needs_followup) || 0,
      'unassigned': parseInt(counts.unassigned) || 0,
      'new-this-week': parseInt(counts.new_this_week) || 0,
    };

    res.json({
      segments: [
        ...dynamicSegments.map(s => ({
          ...s,
          count: countMap[s.id] || 0,
        })),
        ...segments.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          icon: s.icon,
          color: s.color,
          isSystem: s.is_system,
          filters: s.filters,
          count: 0, // Would need to calculate
          createdAt: s.created_at,
        })),
      ],
    });
  } catch (error) {
    console.error("[CRM Segments] Error:", error);
    res.status(500).json({ error: "Failed to load segments" });
  }
});

/**
 * GET /api/crm/segments/:id/leads
 * Get leads matching a segment
 */
router.get("/segments/:id/leads", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '25' } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(100, parseInt(limit as string) || 25);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';

    switch (id) {
      case 'hot-leads':
        whereClause = "score_tier IN ('hot', 'on_fire') OR lead_score >= 80";
        break;
      case 'stale-leads':
        whereClause = "status NOT IN ('won', 'lost') AND COALESCE(last_contacted_at, created_at) < NOW() - INTERVAL '7 days'";
        break;
      case 'high-value':
        whereClause = "estimated_value >= 500000";
        break;
      case 'needs-followup':
        whereClause = "next_follow_up IS NOT NULL AND next_follow_up <= NOW() AND status NOT IN ('won', 'lost')";
        break;
      case 'unassigned':
        whereClause = "assigned_to IS NULL AND status NOT IN ('won', 'lost')";
        break;
      case 'new-this-week':
        whereClause = "created_at > NOW() - INTERVAL '7 days'";
        break;
      default:
        return res.status(404).json({ error: "Segment not found" });
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM leads WHERE ${whereClause}`);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT * FROM leads
      WHERE ${whereClause}
      ORDER BY lead_score DESC NULLS LAST, created_at DESC
      LIMIT $1 OFFSET $2
    `, [limitNum, offset]);

    res.json({
      leads: result.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        pipelineStage: row.pipeline_stage,
        leadScore: row.lead_score,
        scoreTier: row.score_tier,
        estimatedValue: row.estimated_value,
        source: row.source,
        assignedTo: row.assigned_to,
        tags: row.tags,
        createdAt: row.created_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("[CRM Segment Leads] Error:", error);
    res.status(500).json({ error: "Failed to load segment leads" });
  }
});

// =============================================================================
// ACTIVITY HISTORY
// =============================================================================

/**
 * GET /api/crm/activities
 * Get all activities across all leads with filters
 */
router.get("/activities", async (req: Request, res: Response) => {
  try {
    const {
      type,
      leadId,
      performedBy,
      search = '',
      dateFrom,
      dateTo,
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(100, parseInt(limit as string) || 50);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT
        la.*,
        l.first_name as lead_first_name,
        l.last_name as lead_last_name,
        l.email as lead_email,
        u.first_name as performer_first_name,
        u.last_name as performer_last_name
      FROM lead_activities la
      JOIN leads l ON la.lead_id = l.id
      LEFT JOIN users u ON la.performed_by = u.id::text
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== 'all') {
      query += ` AND la.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (leadId) {
      query += ` AND la.lead_id = $${paramIndex}`;
      params.push(leadId);
      paramIndex++;
    }

    if (performedBy && performedBy !== 'all') {
      query += ` AND la.performed_by = $${paramIndex}`;
      params.push(performedBy);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        la.title ILIKE $${paramIndex} OR
        la.description ILIKE $${paramIndex} OR
        l.first_name ILIKE $${paramIndex} OR
        l.last_name ILIKE $${paramIndex} OR
        CONCAT(l.first_name, ' ', l.last_name) ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (dateFrom) {
      query += ` AND la.created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      query += ` AND la.created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) FROM'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY la.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    // Get activity type counts for facets
    const typeFacets = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM lead_activities
      GROUP BY type
      ORDER BY count DESC
    `);

    // Get recent performers
    const performerFacets = await pool.query(`
      SELECT
        la.performed_by,
        u.first_name,
        u.last_name,
        COUNT(*) as count
      FROM lead_activities la
      LEFT JOIN users u ON la.performed_by = u.id::text
      WHERE la.performed_by IS NOT NULL
      GROUP BY la.performed_by, u.first_name, u.last_name
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      activities: result.rows.map((row: any) => ({
        id: row.id,
        leadId: row.lead_id,
        lead: {
          id: row.lead_id,
          firstName: row.lead_first_name,
          lastName: row.lead_last_name,
          email: row.lead_email,
        },
        type: row.type,
        title: row.title,
        description: row.description,
        oldStatus: row.old_status,
        newStatus: row.new_status,
        performedBy: row.performed_by,
        performerName: row.performer_first_name
          ? `${row.performer_first_name} ${row.performer_last_name}`
          : 'System',
        createdAt: row.created_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      facets: {
        types: typeFacets.rows.map((r: any) => ({
          type: r.type,
          count: parseInt(r.count),
        })),
        performers: performerFacets.rows.map((r: any) => ({
          id: r.performed_by,
          name: r.first_name ? `${r.first_name} ${r.last_name}` : 'Unknown',
          count: parseInt(r.count),
        })),
      },
    });
  } catch (error) {
    console.error("[CRM Activities] Error:", error);
    res.status(500).json({ error: "Failed to load activities" });
  }
});

/**
 * GET /api/crm/activities/summary
 * Get activity summary stats
 */
router.get("/activities/summary", async (req: Request, res: Response) => {
  try {
    const { days = '7' } = req.query;
    const daysNum = parseInt(days as string) || 7;

    const result = await pool.query(`
      SELECT
        COUNT(*) as total_activities,
        COUNT(DISTINCT lead_id) as leads_touched,
        COUNT(DISTINCT performed_by) as active_users,
        COUNT(*) FILTER (WHERE type = 'call') as calls,
        COUNT(*) FILTER (WHERE type = 'email') as emails,
        COUNT(*) FILTER (WHERE type = 'sms') as sms,
        COUNT(*) FILTER (WHERE type = 'meeting') as meetings,
        COUNT(*) FILTER (WHERE type = 'note') as notes,
        COUNT(*) FILTER (WHERE type = 'stage_change') as stage_changes,
        COUNT(*) FILTER (WHERE type = 'status_change') as status_changes
      FROM lead_activities
      WHERE created_at > NOW() - INTERVAL '${daysNum} days'
    `);

    const stats = result.rows[0];

    // Get activity trend by day
    const trendResult = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM lead_activities
      WHERE created_at > NOW() - INTERVAL '${daysNum} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Get top performers
    const topPerformers = await pool.query(`
      SELECT
        la.performed_by,
        u.first_name,
        u.last_name,
        COUNT(*) as activity_count
      FROM lead_activities la
      LEFT JOIN users u ON la.performed_by = u.id::text
      WHERE la.created_at > NOW() - INTERVAL '${daysNum} days'
        AND la.performed_by IS NOT NULL
      GROUP BY la.performed_by, u.first_name, u.last_name
      ORDER BY activity_count DESC
      LIMIT 5
    `);

    res.json({
      period: `${daysNum} days`,
      summary: {
        totalActivities: parseInt(stats.total_activities) || 0,
        leadsTouched: parseInt(stats.leads_touched) || 0,
        activeUsers: parseInt(stats.active_users) || 0,
      },
      byType: {
        calls: parseInt(stats.calls) || 0,
        emails: parseInt(stats.emails) || 0,
        sms: parseInt(stats.sms) || 0,
        meetings: parseInt(stats.meetings) || 0,
        notes: parseInt(stats.notes) || 0,
        stageChanges: parseInt(stats.stage_changes) || 0,
        statusChanges: parseInt(stats.status_changes) || 0,
      },
      trend: trendResult.rows.map((r: any) => ({
        date: r.date,
        count: parseInt(r.count),
      })),
      topPerformers: topPerformers.rows.map((r: any) => ({
        id: r.performed_by,
        name: r.first_name ? `${r.first_name} ${r.last_name}` : 'Unknown',
        count: parseInt(r.activity_count),
      })),
    });
  } catch (error) {
    console.error("[CRM Activity Summary] Error:", error);
    res.status(500).json({ error: "Failed to load activity summary" });
  }
});

export default router;
