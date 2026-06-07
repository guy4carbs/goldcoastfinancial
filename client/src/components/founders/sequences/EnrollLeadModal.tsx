/**
 * EnrollLeadModal — search the CRM lead list (debounced) and enroll the
 * selected lead into a sequence. Uses main's lead-search endpoint
 *   GET /api/ops/crm/leads?search=&page=
 * which returns snake_case rows (raw pool.query). We normalise here.
 *
 * Restyled to the Gold Coast design language. Ported from heritage EnrollLeadModal.
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Check, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GCModal, GCPrimaryButton, GCSecondaryButton } from "@/components/gc";
import { useEnrollLead, type Sequence } from "@/hooks/useSequences";
import { SEQ_INPUT_STYLE } from "./shared";

interface LeadRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface LeadContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface Props {
  sequence: Sequence;
  onClose: () => void;
}

function leadName(lead: LeadContact): string {
  const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
  return name || lead.email || "Unknown lead";
}

export function EnrollLeadModal({ sequence, onClose }: Props) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<LeadContact | null>(null);
  const enrollMutation = useEnrollLead();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useQuery<LeadContact[]>({
    queryKey: [
      `/api/ops/crm/leads?page=0${debounced ? `&search=${encodeURIComponent(debounced)}` : ""}`,
      debounced,
    ],
    queryFn: async () => {
      const url = `/api/ops/crm/leads?page=0${
        debounced ? `&search=${encodeURIComponent(debounced)}` : ""
      }`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to search leads");
      const rows = (await res.json()) as LeadRow[];
      return rows.slice(0, 25).map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
      }));
    },
  });

  const leads = data ?? [];

  const handleEnroll = async () => {
    if (!selected) return toast({ title: "Select a lead to enroll", variant: "destructive" });
    try {
      await enrollMutation.mutateAsync({ sequenceId: sequence.id, leadId: selected.id });
      toast({ title: `Enrolled ${leadName(selected)} in "${sequence.name}"` });
      onClose();
    } catch (err: any) {
      toast({ title: err?.message || "Failed to enroll lead", variant: "destructive" });
    }
  };

  return (
    <GCModal
      title={`Enroll Lead — ${sequence.name}`}
      subtitle="Search the CRM lead list and enroll a contact into this sequence."
      icon={<UserPlus className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
      onClose={onClose}
      width={520}
      footer={
        <div className="flex gap-3">
          <GCSecondaryButton fullWidth onClick={onClose}>
            Cancel
          </GCSecondaryButton>
          <GCPrimaryButton
            fullWidth
            disabled={!selected || enrollMutation.isPending}
            onClick={handleEnroll}
          >
            {enrollMutation.isPending ? "Enrolling…" : "Enroll Lead"}
          </GCPrimaryButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--gc-text-muted)" }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads by name or email…"
            style={{ ...SEQ_INPUT_STYLE, paddingLeft: 36 }}
            data-testid="input-enroll-search"
          />
        </div>

        <div
          style={{
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-sm)",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div
              className="py-6 text-center"
              style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}
            >
              Searching…
            </div>
          ) : leads.length === 0 ? (
            <div
              className="py-6 text-center"
              style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}
            >
              No leads found.
            </div>
          ) : (
            leads.map((lead) => {
              const isSel = selected?.id === lead.id;
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5"
                  style={{
                    background: isSel ? "var(--gc-hover-overlay)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--gc-border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: "var(--gc-text-base)",
                        fontWeight: 500,
                        color: "var(--gc-text-primary)",
                      }}
                    >
                      {leadName(lead)}
                    </p>
                    <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                      {lead.email || "no email"}
                    </p>
                  </div>
                  {isSel && <Check className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />}
                </button>
              );
            })
          )}
        </div>

        {selected && (
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)",
              borderRadius: "var(--gc-radius-sm)",
            }}
          >
            <UserPlus className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
            <span style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>
              {leadName(selected)} selected
            </span>
          </div>
        )}
      </div>
    </GCModal>
  );
}
