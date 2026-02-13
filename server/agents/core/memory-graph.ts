/**
 * ENTERPRISE MEMORY GRAPH
 * Shared knowledge layer for all agents.
 * Stores leads, clients, conversations, policies, events,
 * and relationships between them.
 *
 * This is the single source of truth.
 * No agent maintains private state — everything goes through here.
 */

import { randomUUID } from 'crypto';

// ─── Node Types ──────────────────────────────────────────────────
export enum NodeType {
  LEAD = 'LEAD',
  CLIENT = 'CLIENT',
  POLICY = 'POLICY',
  CONVERSATION = 'CONVERSATION',
  APPOINTMENT = 'APPOINTMENT',
  APPLICATION = 'APPLICATION',
  CLAIM = 'CLAIM',
  PAYMENT = 'PAYMENT',
  AGENT_INTERACTION = 'AGENT_INTERACTION',
  DOCUMENT = 'DOCUMENT',
  TASK = 'TASK',
  NOTE = 'NOTE',
}

// ─── Edge Types ──────────────────────────────────────────────────
export enum EdgeType {
  HAS_POLICY = 'HAS_POLICY',
  HAS_CONVERSATION = 'HAS_CONVERSATION',
  HAS_APPOINTMENT = 'HAS_APPOINTMENT',
  HAS_APPLICATION = 'HAS_APPLICATION',
  HAS_CLAIM = 'HAS_CLAIM',
  HAS_PAYMENT = 'HAS_PAYMENT',
  CONVERTED_FROM = 'CONVERTED_FROM',
  REFERRED_BY = 'REFERRED_BY',
  ASSIGNED_TO = 'ASSIGNED_TO',
  RELATED_TO = 'RELATED_TO',
  TRIGGERED_BY = 'TRIGGERED_BY',
  RESULTED_IN = 'RESULTED_IN',
}

// ─── Graph Node ──────────────────────────────────────────────────
export interface GraphNode<T = any> {
  id: string;
  type: NodeType;
  data: T;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  createdBy: string; // Agent ID
  version: number;
}

// ─── Graph Edge ──────────────────────────────────────────────────
export interface GraphEdge {
  id: string;
  type: EdgeType;
  sourceId: string;
  targetId: string;
  metadata?: Record<string, any>;
  createdAt: number;
  createdBy: string;
}

// ─── Lead Data ───────────────────────────────────────────────────
export interface LeadData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source: string;
  sourceCost?: number;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  height?: string;
  weight?: string;
  income?: number;
  householdSize?: number;
  medicalBackground?: string;
  coverageType?: string;
  coverageAmount?: string;
  heatScore?: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  stage: 'raw' | 'enriched' | 'scored' | 'contacted' | 'qualified' | 'appointment' | 'sold' | 'lost';
  assignedAgent?: string;
  lastContactedAt?: number;
  nextFollowUpAt?: number;
  tags: string[];
  customFields?: Record<string, any>;
}

// ─── Client Data ─────────────────────────────────────────────────
export interface ClientData extends LeadData {
  stage: 'sold';
  policies: string[];
  lifetimeValue: number;
  retentionScore?: number;
  lastInteractionAt: number;
  preferredContactMethod?: 'phone' | 'email' | 'sms' | 'social';
}

// ─── Policy Data ─────────────────────────────────────────────────
export interface PolicyData {
  policyNumber?: string;
  type: 'term_life' | 'whole_life' | 'iul' | 'final_expense' | 'mortgage_protection' | 'annuity';
  carrier: string;
  coverageAmount: number;
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annually';
  status: 'pending' | 'active' | 'lapsed' | 'cancelled' | 'claimed';
  effectiveDate?: string;
  expirationDate?: string;
  commission: number;
  commissionType: 'percentage' | 'flat';
  underwritingStatus?: 'pending' | 'approved' | 'declined' | 'modified';
}

// ─── Conversation Data ───────────────────────────────────────────
export interface ConversationData {
  channel: 'phone' | 'email' | 'sms' | 'social' | 'chat' | 'web';
  direction: 'inbound' | 'outbound';
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  duration?: number;
  outcome?: string;
  transcript?: string;
  agentId: string;
  nextAction?: string;
}

// ─── Memory Graph ────────────────────────────────────────────────
export class MemoryGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private nodesByType: Map<NodeType, Set<string>> = new Map();
  private edgesBySource: Map<string, Set<string>> = new Map();
  private edgesByTarget: Map<string, Set<string>> = new Map();

  // Indexes for fast lookup
  private emailIndex: Map<string, string> = new Map();
  private phoneIndex: Map<string, string> = new Map();

  private static instance: MemoryGraph;

  static getInstance(): MemoryGraph {
    if (!MemoryGraph.instance) {
      MemoryGraph.instance = new MemoryGraph();
    }
    return MemoryGraph.instance;
  }

  // ─── Node Operations ───────────────────────────────────────
  addNode<T = any>(type: NodeType, data: T, createdBy: string, tags: string[] = []): GraphNode<T> {
    const node: GraphNode<T> = {
      id: randomUUID(),
      type,
      data,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy,
      version: 1,
    };

    this.nodes.set(node.id, node);

    // Type index
    if (!this.nodesByType.has(type)) {
      this.nodesByType.set(type, new Set());
    }
    this.nodesByType.get(type)!.add(node.id);

    // Build search indexes
    this.indexNode(node);

    return node;
  }

  updateNode<T = any>(nodeId: string, updates: Partial<T>, updatedBy: string): GraphNode<T> | null {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    node.data = { ...node.data, ...updates };
    node.updatedAt = Date.now();
    node.version++;

    this.indexNode(node);
    return node as GraphNode<T>;
  }

  getNode<T = any>(nodeId: string): GraphNode<T> | null {
    return (this.nodes.get(nodeId) as GraphNode<T>) || null;
  }

  getNodesByType<T = any>(type: NodeType): GraphNode<T>[] {
    const ids = this.nodesByType.get(type);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.nodes.get(id)!).filter(Boolean) as GraphNode<T>[];
  }

  deleteNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Remove edges
    const sourceEdges = this.edgesBySource.get(nodeId);
    if (sourceEdges) {
      sourceEdges.forEach((edgeId) => this.edges.delete(edgeId));
      this.edgesBySource.delete(nodeId);
    }
    const targetEdges = this.edgesByTarget.get(nodeId);
    if (targetEdges) {
      targetEdges.forEach((edgeId) => this.edges.delete(edgeId));
      this.edgesByTarget.delete(nodeId);
    }

    // Remove from type index
    this.nodesByType.get(node.type)?.delete(nodeId);

    this.nodes.delete(nodeId);
    return true;
  }

  // ─── Edge Operations ───────────────────────────────────────
  addEdge(
    type: EdgeType,
    sourceId: string,
    targetId: string,
    createdBy: string,
    metadata?: Record<string, any>
  ): GraphEdge | null {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return null;

    const edge: GraphEdge = {
      id: randomUUID(),
      type,
      sourceId,
      targetId,
      metadata,
      createdAt: Date.now(),
      createdBy,
    };

    this.edges.set(edge.id, edge);

    if (!this.edgesBySource.has(sourceId)) {
      this.edgesBySource.set(sourceId, new Set());
    }
    this.edgesBySource.get(sourceId)!.add(edge.id);

    if (!this.edgesByTarget.has(targetId)) {
      this.edgesByTarget.set(targetId, new Set());
    }
    this.edgesByTarget.get(targetId)!.add(edge.id);

    return edge;
  }

  getEdgesFrom(nodeId: string): GraphEdge[] {
    const edgeIds = this.edgesBySource.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map((id) => this.edges.get(id)!).filter(Boolean);
  }

  getEdgesTo(nodeId: string): GraphEdge[] {
    const edgeIds = this.edgesByTarget.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map((id) => this.edges.get(id)!).filter(Boolean);
  }

  getRelated(nodeId: string, edgeType?: EdgeType): GraphNode[] {
    const edges = [...this.getEdgesFrom(nodeId), ...this.getEdgesTo(nodeId)];
    const filtered = edgeType ? edges.filter((e) => e.type === edgeType) : edges;
    const relatedIds = filtered.map((e) => (e.sourceId === nodeId ? e.targetId : e.sourceId));
    return relatedIds.map((id) => this.nodes.get(id)!).filter(Boolean);
  }

  // ─── Search & Query ────────────────────────────────────────
  findByEmail(email: string): GraphNode | null {
    const nodeId = this.emailIndex.get(email.toLowerCase());
    return nodeId ? this.nodes.get(nodeId) || null : null;
  }

  findByPhone(phone: string): GraphNode | null {
    const normalized = phone.replace(/\D/g, '');
    const nodeId = this.phoneIndex.get(normalized);
    return nodeId ? this.nodes.get(nodeId) || null : null;
  }

  search(query: {
    type?: NodeType;
    tags?: string[];
    stage?: string;
    minHeatScore?: number;
    createdAfter?: number;
    createdBefore?: number;
    limit?: number;
  }): GraphNode[] {
    let results = Array.from(this.nodes.values());

    if (query.type) {
      results = results.filter((n) => n.type === query.type);
    }
    if (query.tags?.length) {
      results = results.filter((n) => query.tags!.some((t) => n.tags.includes(t)));
    }
    if (query.stage) {
      results = results.filter((n) => (n.data as any)?.stage === query.stage);
    }
    if (query.minHeatScore !== undefined) {
      results = results.filter((n) => (n.data as any)?.heatScore >= query.minHeatScore!);
    }
    if (query.createdAfter) {
      results = results.filter((n) => n.createdAt >= query.createdAfter!);
    }
    if (query.createdBefore) {
      results = results.filter((n) => n.createdAt <= query.createdBefore!);
    }

    // Sort by most recent
    results.sort((a, b) => b.updatedAt - a.updatedAt);

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  // ─── Indexing ──────────────────────────────────────────────
  private indexNode(node: GraphNode): void {
    const data = node.data as any;
    if (data?.email) {
      this.emailIndex.set(data.email.toLowerCase(), node.id);
    }
    if (data?.phone) {
      this.phoneIndex.set(data.phone.replace(/\D/g, ''), node.id);
    }
  }

  // ─── Stats ─────────────────────────────────────────────────
  getStats(): {
    totalNodes: number;
    totalEdges: number;
    nodesByType: Record<string, number>;
    leadsByStage: Record<string, number>;
  } {
    const nodesByType: Record<string, number> = {};
    this.nodesByType.forEach((ids, type) => {
      nodesByType[type] = ids.size;
    });

    const leadsByStage: Record<string, number> = {};
    const leads = this.getNodesByType<LeadData>(NodeType.LEAD);
    leads.forEach((lead) => {
      const stage = lead.data.stage || 'unknown';
      leadsByStage[stage] = (leadsByStage[stage] || 0) + 1;
    });

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodesByType,
      leadsByStage,
    };
  }

  // ─── Export / Import ───────────────────────────────────────
  export(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  import(data: { nodes: GraphNode[]; edges: GraphEdge[] }): void {
    data.nodes.forEach((node) => {
      this.nodes.set(node.id, node);
      if (!this.nodesByType.has(node.type)) {
        this.nodesByType.set(node.type, new Set());
      }
      this.nodesByType.get(node.type)!.add(node.id);
      this.indexNode(node);
    });
    data.edges.forEach((edge) => {
      this.edges.set(edge.id, edge);
      if (!this.edgesBySource.has(edge.sourceId)) {
        this.edgesBySource.set(edge.sourceId, new Set());
      }
      this.edgesBySource.get(edge.sourceId)!.add(edge.id);
      if (!this.edgesByTarget.has(edge.targetId)) {
        this.edgesByTarget.set(edge.targetId, new Set());
      }
      this.edgesByTarget.get(edge.targetId)!.add(edge.id);
    });
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.nodesByType.clear();
    this.edgesBySource.clear();
    this.edgesByTarget.clear();
    this.emailIndex.clear();
    this.phoneIndex.clear();
  }
}

// ─── Export Singleton ────────────────────────────────────────────
export const memoryGraph = MemoryGraph.getInstance();
