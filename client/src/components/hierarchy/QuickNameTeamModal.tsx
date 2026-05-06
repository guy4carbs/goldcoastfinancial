/**
 * QuickNameTeamModal — compact "name a team" wizard. Wraps the new
 * `POST /api/founders/agencies/promote-and-assign` atomic endpoint:
 *
 *   1) (optional) auto-promote the agent to "Team Lead" if their current
 *      hierarchy title is below it
 *   2) create an `agencies` row with name + parent + status='active'
 *   3) assign the agent as the agency's manager via `agency_teams`
 *
 * All three steps run in a single backend transaction, so a mid-flow failure
 * never leaves the agent half-promoted or the agency dangling without a
 * manager.
 *
 * Two opening modes:
 *
 *   - Pre-selected agent (from the HCMSHierarchy context menu): the modal
 *     opens straight to the name + parent fields with the agent locked in.
 *   - No agent (from the Founders Agency Mgmt "Quick Name" header button):
 *     the modal first renders a search picker pulling from
 *     `/api/hcms/hierarchy/flat`, then advances to the name + parent step.
 *
 * Parent agency picker pulls from `/api/founders/agencies/tree` and
 * recursively flattens to a depth-indented flat list. Defaults to the root
 * agency.
 */

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Search, Users } from "lucide-react";
import {
  GCModal,
  GCPrimaryButton,
  GCSecondaryButton,
  GC_FORM_LABEL,
  GC_FORM_INPUT,
} from "@/components/gc";
import { useGCTheme } from "@/components/gc/GCThemeProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Hierarchy titles ranked from highest authority (low number) to lowest.
// "Team Lead" is the threshold — anything below auto-promotes on submit.
const TITLE_RANK: Record<string, number> = {
  Founder: 0,
  "Diamond Director": 1,
  "Platinum Director": 2,
  "Regional Manager": 3,
  "Team Lead": 4,
  "Senior Agent": 5,
  Agent: 6,
  "Associate Agent": 7,
};
const TEAM_LEAD_RANK = TITLE_RANK["Team Lead"];

function isBelowTeamLead(title: string | null | undefined): boolean {
  if (!title) return true;
  const rank = TITLE_RANK[title];
  if (rank === undefined) return true;
  return rank > TEAM_LEAD_RANK;
}

export interface QuickNameAgent {
  id: string;
  firstName: string;
  lastName: string;
  currentTitle?: string;
}

export interface QuickNameTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: QuickNameAgent;
  /** Optional parent override (e.g. for pre-selecting non-root parent). */
  defaultParentAgencyId?: string;
  /** Notified when the wizard's agent picker resolves; mostly for analytics. */
  onAgentPick?: (agentId: string) => void;
}

interface AgencyTreeRow {
  id: string;
  name: string;
  children?: AgencyTreeRow[] | null;
}

interface FlatAgentRow {
  agent_user_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  hierarchy_title?: string | null;
  hierarchy_level?: number | null;
}

const SELECT_TRIGGER =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

// Flatten the recursive agency tree into a list of {id, label, depth} so the
// Radix Select can render a single scrollable column with depth-indents.
function flattenTree(
  node: AgencyTreeRow | undefined | null,
  depth = 0,
  out: Array<{ id: string; label: string; depth: number }> = [],
): Array<{ id: string; label: string; depth: number }> {
  if (!node) return out;
  out.push({ id: node.id, label: node.name, depth });
  (node.children || []).forEach((c) => flattenTree(c, depth + 1, out));
  return out;
}

export function QuickNameTeamModal({
  open,
  onOpenChange,
  agent: initialAgent,
  defaultParentAgencyId,
  onAgentPick,
}: QuickNameTeamModalProps) {
  const { theme } = useGCTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Selected agent state — either passed in or chosen via the picker step.
  const [selectedAgent, setSelectedAgent] = useState<QuickNameAgent | null>(
    initialAgent ?? null,
  );
  const [name, setName] = useState("");
  const [parentAgencyId, setParentAgencyId] = useState<string | null>(
    defaultParentAgencyId ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset whenever the modal closes so re-opens start clean.
  useEffect(() => {
    if (!open) {
      setSelectedAgent(initialAgent ?? null);
      setName("");
      setParentAgencyId(defaultParentAgencyId ?? null);
      setError(null);
      setSearchQuery("");
      setSubmitting(false);
    } else {
      setSelectedAgent(initialAgent ?? null);
      if (defaultParentAgencyId) setParentAgencyId(defaultParentAgencyId);
    }
    // We intentionally only re-run on `open` flips so user-typed state isn't
    // wiped mid-flow. Initial agent / default parent only seed on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Pull the agency tree for the parent picker. Lazy — only loads when modal
  // is open so tree-less callers don't pay the request cost.
  const treeQ = useQuery<AgencyTreeRow>({
    queryKey: ["/api/founders/agencies/tree"],
    enabled: open,
    staleTime: 60_000,
    retry: 1,
  });

  // Pull the flat agent list for the picker step. Only when the caller didn't
  // supply an agent up front.
  const agentsQ = useQuery<FlatAgentRow[]>({
    queryKey: ["/api/hcms/hierarchy/flat"],
    enabled: open && !initialAgent && !selectedAgent,
    staleTime: 60_000,
    retry: 1,
  });

  // Default parent to the root agency once the tree resolves.
  useEffect(() => {
    if (treeQ.data && !parentAgencyId) {
      setParentAgencyId(treeQ.data.id);
    }
  }, [treeQ.data, parentAgencyId]);

  const flatAgencies = useMemo(() => flattenTree(treeQ.data), [treeQ.data]);

  // Axiom MED — soft-warn when the typed team name collides with a sibling
  // already under the selected parent. Client-side check; the backend doesn't
  // enforce uniqueness so this is purely a UX scan-easier nudge. We walk the
  // already-loaded tree from `treeQ.data` to find the parent node, then
  // compare each child's name case-insensitively. Self-edit isn't a concern
  // here since this modal only ever creates a new agency.
  const findNodeById = (
    node: AgencyTreeRow | undefined | null,
    id: string,
  ): AgencyTreeRow | null => {
    if (!node) return null;
    if (node.id === id) return node;
    for (const c of node.children || []) {
      const found = findNodeById(c, id);
      if (found) return found;
    }
    return null;
  };
  const siblingNames = useMemo(() => {
    if (!treeQ.data || !parentAgencyId) return [] as string[];
    const parent = findNodeById(treeQ.data, parentAgencyId);
    return (parent?.children || []).map((c) => c.name.trim().toLowerCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeQ.data, parentAgencyId]);
  const trimmedName = name.trim();
  const nameCollision =
    trimmedName.length > 0 && siblingNames.includes(trimmedName.toLowerCase());

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = agentsQ.data || [];
    if (!q) return list.slice(0, 50);
    return list
      .filter((a) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [agentsQ.data, searchQuery]);

  const promoteAndAssignMut = useMutation({
    mutationFn: async (vars: {
      agentUserId: string;
      name: string;
      parentAgencyId?: string;
    }) => {
      const res = await fetch("/api/founders/agencies/promote-and-assign", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(await csrfHeaders()),
        },
        body: JSON.stringify(vars),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed (${res.status})`);
      }
      return res.json() as Promise<{
        agencyId: string;
        agencyName: string;
        hierarchyChanged: boolean;
        newTitle: string | null;
      }>;
    },
    onSuccess: (data) => {
      toast({ title: `${data.agencyName} created` });
      // Both the founder-side tree AND the HCMS hierarchy tree need a refresh
      // because the auto-promote step updates `agent_hierarchy`. KPI tile
      // counts also bump (agencies count) so invalidate that key too.
      queryClient.invalidateQueries({ queryKey: ["/api/founders/agencies/tree"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/flat"] });
      // KPI cache key has period in it; invalidate the prefix so any period
      // variant refetches.
      queryClient.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === "string" &&
          (q.queryKey[0] as string).startsWith("/api/founders/agencies/kpis"),
      });
      onOpenChange(false);
    },
    onError: (e: any) => {
      setError(e?.message || "Failed to create team.");
    },
  });

  if (!open) return null;

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    if (!selectedAgent) {
      setError("Pick an agent first.");
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Team name is required.");
      return;
    }
    if (trimmed.length > 80) {
      setError("Team name must be 80 characters or fewer.");
      return;
    }
    setSubmitting(true);
    try {
      await promoteAndAssignMut.mutateAsync({
        agentUserId: selectedAgent.id,
        name: trimmed,
        parentAgencyId: parentAgencyId || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Agent picker step (shown when no agent is selected yet) ────────────
  if (!selectedAgent) {
    return (
      <GCModal
        title="Pick an agent"
        subtitle="Choose the agent who will manage the new team."
        onClose={() => onOpenChange(false)}
        width={520}
      >
        <div style={{ marginBottom: "var(--gc-space-3)" }}>
          <label style={GC_FORM_LABEL} htmlFor="qnt-agent-search">
            Search by name or email
          </label>
          <div style={{ position: "relative" }}>
            <Search
              className="w-4 h-4"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gc-text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              id="qnt-agent-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to filter..."
              style={{ ...GC_FORM_INPUT, paddingLeft: 32 }}
              autoFocus
            />
          </div>
        </div>
        <div
          style={{
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
            backgroundColor: "var(--gc-surface)",
            maxHeight: 320,
            overflowY: "auto",
            marginBottom: "var(--gc-space-4)",
          }}
        >
          {agentsQ.isLoading ? (
            <div
              style={{
                padding: "var(--gc-space-4)",
                textAlign: "center",
                color: "var(--gc-text-muted)",
                fontSize: "var(--gc-text-sm)",
              }}
            >
              Loading agents…
            </div>
          ) : filteredAgents.length === 0 ? (
            <div
              style={{
                padding: "var(--gc-space-4)",
                textAlign: "center",
                color: "var(--gc-text-muted)",
                fontSize: "var(--gc-text-sm)",
              }}
            >
              {searchQuery ? "No agents match." : "No agents found."}
            </div>
          ) : (
            filteredAgents.map((a) => {
              const fullName = `${a.first_name} ${a.last_name}`.trim();
              const title = a.hierarchy_title || `Level ${a.hierarchy_level ?? "?"}`;
              return (
                <button
                  key={a.agent_user_id}
                  type="button"
                  onClick={() => {
                    const picked: QuickNameAgent = {
                      id: a.agent_user_id,
                      firstName: a.first_name,
                      lastName: a.last_name,
                      currentTitle: a.hierarchy_title || undefined,
                    };
                    setSelectedAgent(picked);
                    onAgentPick?.(picked.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--gc-border-subtle, var(--gc-border))",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "color-mix(in srgb, var(--gc-gold) 18%, transparent)",
                      color: "var(--gc-gold)",
                      fontWeight: 600,
                      fontSize: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {(a.first_name[0] || "?") + (a.last_name[0] || "")}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {fullName}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--gc-text-xs)",
                        color: "var(--gc-text-muted)",
                      }}
                    >
                      {title}
                      {a.email ? ` · ${a.email}` : ""}
                    </div>
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <GCSecondaryButton onClick={() => onOpenChange(false)}>Cancel</GCSecondaryButton>
        </div>
      </GCModal>
    );
  }

  // ─── Name + parent step (agent already locked in) ────────────────────────
  const fullName = `${selectedAgent.firstName} ${selectedAgent.lastName}`.trim();
  const willPromote = isBelowTeamLead(selectedAgent.currentTitle);

  return (
    <GCModal
      title={`Name ${selectedAgent.firstName}'s Team`}
      subtitle="Creates a lightweight named team (no LLC paperwork) and assigns this agent as the manager."
      onClose={() => onOpenChange(false)}
      width={520}
    >
      <div style={{ marginBottom: "var(--gc-space-4)" }}>
        {/* Agent summary row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "var(--gc-space-3)",
            backgroundColor: "var(--gc-surface-2)",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
            marginBottom: "var(--gc-space-3)",
          }}
        >
          <Users className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-primary)",
                fontWeight: 500,
              }}
            >
              {fullName}
            </div>
            <div
              style={{
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
              }}
            >
              Currently: {selectedAgent.currentTitle || "Agent"}
            </div>
          </div>
          {!initialAgent && (
            <button
              type="button"
              onClick={() => setSelectedAgent(null)}
              style={{
                background: "transparent",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-sm)",
                color: "var(--gc-text-secondary)",
                fontSize: "var(--gc-text-xs)",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              Change
            </button>
          )}
        </div>

        {/* Team name input */}
        <div style={{ marginBottom: "var(--gc-space-3)" }}>
          <label style={GC_FORM_LABEL} htmlFor="qnt-name">
            Team name *
          </label>
          <input
            id="qnt-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            maxLength={80}
            style={GC_FORM_INPUT}
            placeholder={`${selectedAgent.firstName}'s Team`}
            autoFocus
          />
          <div
            style={{
              marginTop: 4,
              fontSize: "11px",
              color: "var(--gc-text-muted)",
            }}
          >
            {name.length}/80
          </div>
          {nameCollision && (
            <p
              style={{
                marginTop: 4,
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-status-warning, #d4a574)",
                fontWeight: 500,
              }}
            >
              ⚠ Another team under this parent is already named "{trimmedName}". You can still proceed, but this may make the tree harder to scan.
            </p>
          )}
        </div>

        {/* Parent agency picker */}
        <div style={{ marginBottom: "var(--gc-space-3)" }}>
          <label style={GC_FORM_LABEL} htmlFor="qnt-parent">
            Parent agency
          </label>
          <Select
            value={parentAgencyId || ""}
            onValueChange={(v) => setParentAgencyId(v)}
            disabled={submitting || treeQ.isLoading}
          >
            <SelectTrigger id="qnt-parent" className={SELECT_TRIGGER}>
              <SelectValue placeholder={treeQ.isLoading ? "Loading…" : "Select parent agency"} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              collisionPadding={8}
              avoidCollisions
              data-theme={theme}
              className={SELECT_CONTENT}
              style={{ maxHeight: "var(--radix-select-content-available-height)" }}
            >
              {flatAgencies.map((a) => (
                <SelectItem key={a.id} value={a.id} className={SELECT_ITEM}>
                  {a.depth > 0 ? "↳ ".padStart(a.depth * 2 + 2, " ") : ""}
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto-promote notice — only when current title is below Team Lead */}
        {willPromote && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "var(--gc-space-2) var(--gc-space-3)",
              backgroundColor: "color-mix(in srgb, var(--gc-status-warning, #d4a574) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--gc-status-warning, #d4a574) 40%, transparent)",
              borderRadius: "var(--gc-radius-sm)",
              marginBottom: "var(--gc-space-2)",
            }}
          >
            <Lock
              className="w-4 h-4"
              style={{ color: "var(--gc-status-warning, #d4a574)", marginTop: 1 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-primary)",
                  fontWeight: 500,
                }}
              >
                Will promote {selectedAgent.firstName} to Team Lead
              </div>
              <div
                style={{
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                  marginTop: 2,
                }}
              >
                Currently: {selectedAgent.currentTitle || "Agent"}
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 999,
                backgroundColor: "color-mix(in srgb, var(--gc-status-warning, #d4a574) 22%, transparent)",
                color: "var(--gc-status-warning, #d4a574)",
                border: "1px solid var(--gc-status-warning, #d4a574)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                alignSelf: "center",
              }}
            >
              AUTO
            </span>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: "var(--gc-space-3)",
            padding: "var(--gc-space-2) var(--gc-space-3)",
            backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 12%, transparent)",
            border: "1px solid var(--gc-status-terminated)",
            borderRadius: "var(--gc-radius-sm)",
            color: "var(--gc-status-terminated)",
            fontSize: "var(--gc-text-sm)",
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <GCSecondaryButton onClick={() => onOpenChange(false)} disabled={submitting}>
          Cancel
        </GCSecondaryButton>
        <GCPrimaryButton onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Save"}
        </GCPrimaryButton>
      </div>
    </GCModal>
  );
}
