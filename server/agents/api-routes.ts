/**
 * GCF AGENT SYSTEM — API ROUTES
 * Express router for agent management, monitoring, and control.
 */

import { Router, Request, Response } from 'express';
import { AgentRegistry } from './index';
import { eventBus, securityLayer, analyticsLedger, memoryGraph, EventType, EventBus } from './core';
import { changeChainEngine } from './core/change-chain-engine';
import { vetoEngine } from './core/veto-engine';
import { ChangeType } from './core/governance-types';
import { GovernanceAgent } from './governance';

export function createAgentRoutes(registry: AgentRegistry): Router {
  const router = Router();

  // GET /api/agents — list all agents with status/metrics
  router.get('/agents', (_req: Request, res: Response) => {
    const agents = registry.getAllAgents().map(agent => agent.getInfo());
    res.json({
      count: agents.length,
      agents: agents.sort((a, b) => a.tier - b.tier),
    });
  });

  // GET /api/agents/stats — system-wide stats
  router.get('/agents/stats', (_req: Request, res: Response) => {
    const agents = registry.getAllAgents();
    const busStats = eventBus.getStats();
    const secStats = securityLayer.getStats();
    const ledgerStats = analyticsLedger.getStats();
    const memStats = memoryGraph.getStats();
    const revenue = analyticsLedger.getRevenueSummary('30d');
    const funnel = analyticsLedger.getFunnelMetrics('30d');

    const statusCounts: Record<string, number> = {};
    agents.forEach(a => {
      const s = a.getStatus();
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    res.json({
      agents: { total: agents.length, byStatus: statusCounts },
      events: busStats,
      security: secStats,
      analytics: ledgerStats,
      memory: memStats,
      revenue,
      funnel,
    });
  });

  // GET /api/agents/tiers — tier breakdown
  router.get('/agents/tiers', (_req: Request, res: Response) => {
    const agents = registry.getAllAgents();
    const tiers: Record<number, Array<{ id: string; name: string; status: string }>> = {};

    agents.forEach(a => {
      const info = a.getInfo();
      if (!tiers[info.tier]) tiers[info.tier] = [];
      tiers[info.tier].push({ id: info.id, name: info.name, status: info.status });
    });

    res.json({ tiers });
  });

  // GET /api/agents/events — recent event log
  router.get('/agents/events', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = eventBus.getAuditLog(limit);
    res.json({
      count: events.length,
      events: events.map(e => ({
        id: e.id,
        type: e.type,
        source: e.source,
        timestamp: e.timestamp,
        tier: e.metadata?.tier,
        priority: e.metadata?.priority,
        payloadKeys: Object.keys(e.payload || {}),
      })),
    });
  });

  // GET /api/agents/:id — single agent detail
  router.get('/agents/:id', (req: Request, res: Response) => {
    const agent = registry.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent.getInfo());
  });

  // POST /api/agents/:id/pause — pause agent
  router.post('/agents/:id/pause', (req: Request, res: Response) => {
    const agent = registry.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    // Send pause directive via orchestrator
    const event = {
      id: '',
      type: 'ORCHESTRATOR_DIRECTIVE' as any,
      source: 'api',
      timestamp: Date.now(),
      payload: { targetAgentId: req.params.id, action: 'pause' },
      metadata: { tier: 0, priority: 'high' as const },
    };
    eventBus.emit(event);
    res.json({ success: true, message: `Pause directive sent to ${req.params.id}` });
  });

  // POST /api/agents/:id/resume — resume agent
  router.post('/agents/:id/resume', (req: Request, res: Response) => {
    const agent = registry.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    const event = {
      id: '',
      type: 'ORCHESTRATOR_DIRECTIVE' as any,
      source: 'api',
      timestamp: Date.now(),
      payload: { targetAgentId: req.params.id, action: 'resume' },
      metadata: { tier: 0, priority: 'high' as const },
    };
    eventBus.emit(event);
    res.json({ success: true, message: `Resume directive sent to ${req.params.id}` });
  });

  // ─── GOVERNANCE ENDPOINTS ──────────────────────────────────

  // POST /api/agents/governance/task — submit a governance task
  router.post('/agents/governance/task', (req: Request, res: Response) => {
    const { title, description, changeType, submittedBy } = req.body;
    if (!title || !changeType) {
      return res.status(400).json({ error: 'title and changeType are required' });
    }
    if (!Object.values(ChangeType).includes(changeType)) {
      return res.status(400).json({ error: `Invalid changeType. Valid: ${Object.values(ChangeType).join(', ')}` });
    }

    const event = EventBus.createEvent(
      EventType.GOVERNANCE_TASK_SUBMITTED,
      submittedBy || 'api',
      { title, description, changeType, submittedBy: submittedBy || 'api' },
      { metadata: { tier: 11, priority: 'high' } }
    );
    eventBus.emit(event);

    res.json({ success: true, message: `Governance task submitted: ${title}`, changeType });
  });

  // GET /api/agents/governance/chains — active change chains
  router.get('/agents/governance/chains', (_req: Request, res: Response) => {
    const active = changeChainEngine.getActiveChains();
    const stats = changeChainEngine.getStats();
    res.json({ stats, activeChains: active });
  });

  // GET /api/agents/governance/vetoes — active vetoes
  router.get('/agents/governance/vetoes', (_req: Request, res: Response) => {
    const active = vetoEngine.getActiveVetoes();
    const stats = vetoEngine.getStats();
    res.json({ stats, activeVetoes: active });
  });

  // GET /api/agents/governance/agents — governance agent details
  router.get('/agents/governance/agents', (_req: Request, res: Response) => {
    const govAgents = registry.getAllAgents()
      .filter(a => a.config.tier >= 11)
      .map(a => {
        const info = a.getInfo();
        const govInfo = (a as GovernanceAgent).getGovernanceInfo?.();
        return { ...info, governance: govInfo };
      });
    res.json({ count: govAgents.length, agents: govAgents });
  });

  // POST /api/agents/kill-switch — emergency stop all
  router.post('/agents/kill-switch', (_req: Request, res: Response) => {
    securityLayer.activateGlobalKillSwitch();
    res.json({
      success: true,
      message: '☠️ GLOBAL KILL SWITCH ACTIVATED — All agents halted',
      deactivateEndpoint: 'POST /api/agents/kill-switch/deactivate',
    });
  });

  // POST /api/agents/kill-switch/deactivate
  router.post('/agents/kill-switch/deactivate', (_req: Request, res: Response) => {
    securityLayer.deactivateGlobalKillSwitch();
    res.json({ success: true, message: '✅ Global kill switch deactivated' });
  });

  return router;
}
