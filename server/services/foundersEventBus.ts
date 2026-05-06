import { EventEmitter } from "events";

export type FoundersEvent =
  | { type: "lead:new"; lead: { id: string; firstName: string; lastName: string; email?: string; source?: string } }
  | { type: "lead:imported"; importId: string; accepted: number; skipped: number }
  | { type: "lead:distributed"; batchId: string; managerIds: string[]; leadCount: number };

class FoundersEventBus extends EventEmitter {
  emitFounder(ev: FoundersEvent) {
    this.emit("event", ev);
  }
  onFounder(cb: (ev: FoundersEvent) => void) {
    this.on("event", cb);
    return () => this.off("event", cb);
  }
}

export const foundersEventBus = new FoundersEventBus();
foundersEventBus.setMaxListeners(100); // allow many SSE connections

// ============================================================================
// Phase D Wave 1 — Hierarchy + per-user role event channels (Conduit)
// ----------------------------------------------------------------------------
// Two new pub/sub channels share the same EventEmitter pattern as the founder
// leads bus above, but use distinct event names so subscribers never cross
// streams.
//
//   • `hierarchy:changed`  — broadcast to every admin SSE subscriber.
//   • `user:role:changed`  — broadcast over a single bus, but each subscriber
//                            is registered with a `targetUserId` filter and
//                            ONLY receives events whose `userId` matches.
//                            The filter happens server-side in `onRoleChanged`
//                            so a stranger's event can never leak to another
//                            user's stream.
// ============================================================================

export type HierarchyChangedEvent = {
  type: "hierarchy:changed";
  agentId: string;
  newTitle: string;
  newRole: string;
  ts: string;
};

export type RoleChangedEvent = {
  type: "role:changed";
  userId: string;
  oldRole: string;
  newRole: string;
  ts: string;
};

class HierarchyEventBus extends EventEmitter {}
const hierarchyEventBus = new HierarchyEventBus();
hierarchyEventBus.setMaxListeners(200); // many admin sessions + per-user subs

const HIERARCHY_TOPIC = "hierarchy:changed";
const ROLE_TOPIC = "user:role:changed";

/** Push a hierarchy change to every admin SSE subscriber. */
export function emitHierarchyChanged(payload: HierarchyChangedEvent): void {
  hierarchyEventBus.emit(HIERARCHY_TOPIC, payload);
}

/**
 * Push a role-change event onto the per-user bus. `onRoleChanged` filters by
 * `userId` server-side so only the affected user's stream receives this.
 */
export function emitRoleChanged(payload: RoleChangedEvent): void {
  hierarchyEventBus.emit(ROLE_TOPIC, payload);
}

/** Subscribe to the admin hierarchy broadcast channel. Returns an unsubscribe. */
export function onHierarchyChanged(
  handler: (ev: HierarchyChangedEvent) => void,
): () => void {
  hierarchyEventBus.on(HIERARCHY_TOPIC, handler);
  return () => hierarchyEventBus.off(HIERARCHY_TOPIC, handler);
}

/**
 * Subscribe to role changes for a SINGLE user. The `targetUserId` filter is
 * applied here, server-side, so a subscriber bound to user A can never see
 * an event for user B even if both are listening on the same process.
 */
export function onRoleChanged(
  targetUserId: string,
  handler: (ev: RoleChangedEvent) => void,
): () => void {
  const filtered = (ev: RoleChangedEvent) => {
    if (ev.userId === targetUserId) handler(ev);
  };
  hierarchyEventBus.on(ROLE_TOPIC, filtered);
  return () => hierarchyEventBus.off(ROLE_TOPIC, filtered);
}
