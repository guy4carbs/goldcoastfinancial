/**
 * EnrollLeadModal — search leads (debounced) via the command combobox and
 * enroll the selected lead into a sequence.
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus, Check } from "lucide-react";
import { RADIUS, TYPE, COLORS } from "@/lib/heritageDesignSystem";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useEnrollLead, type Sequence } from "@/hooks/useSequences";
import { GlassModal, primaryBtnStyle, ghostBtnStyle } from "./shared";

interface LeadContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  contactType: string;
}

interface Props {
  sequence: Sequence;
  onClose: () => void;
}

export function EnrollLeadModal({ sequence, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<LeadContact | null>(null);
  const enrollMutation = useEnrollLead();

  // Debounce search input (300ms).
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/crm/contacts", "lead", debounced],
    queryFn: async () => {
      const params = new URLSearchParams({ type: "lead", limit: "25" });
      if (debounced) params.set("search", debounced);
      const res = await fetch(`/api/crm/contacts?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to search leads");
      return res.json() as Promise<{ contacts: LeadContact[] }>;
    },
  });

  const leads = data?.contacts ?? [];

  const handleEnroll = async () => {
    if (!selected) {
      toast.error("Select a lead to enroll");
      return;
    }
    try {
      await enrollMutation.mutateAsync({ sequenceId: sequence.id, leadId: selected.id });
      toast.success(`Enrolled ${leadName(selected)} in "${sequence.name}"`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to enroll lead");
    }
  };

  return (
    <GlassModal title={`Enroll Lead — ${sequence.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div
          style={{
            border: `1px solid ${COLORS.gray[200]}`,
            borderRadius: RADIUS.input,
            overflow: "hidden",
          }}
        >
          {/* shouldFilter=false: server already filters by the search query */}
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search leads by name or email…" value={query} onValueChange={setQuery} />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center" style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
                  Searching…
                </div>
              ) : (
                <>
                  <CommandEmpty>No leads found.</CommandEmpty>
                  <CommandGroup>
                    {leads.map((lead) => {
                      const isSel = selected?.id === lead.id;
                      return (
                        <CommandItem
                          key={lead.id}
                          value={lead.id}
                          onSelect={() => setSelected(lead)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>
                              {leadName(lead)}
                            </p>
                            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                              {lead.email || "no email"}
                            </p>
                          </div>
                          {isSel && <Check className="w-4 h-4" style={{ color: COLORS.primary.violet[600] }} />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>

        {selected && (
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ background: COLORS.primary.violet[50], borderRadius: RADIUS.input }}
          >
            <UserPlus className="w-4 h-4" style={{ color: COLORS.primary.violet[600] }} />
            <span style={{ fontSize: TYPE.meta, color: COLORS.primary.violet[700] }}>
              {leadName(selected)} selected
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 hover:bg-gray-200" style={ghostBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={!selected || enrollMutation.isPending}
            className="flex-1 disabled:opacity-50"
            style={primaryBtnStyle}
          >
            {enrollMutation.isPending ? "Enrolling…" : "Enroll Lead"}
          </button>
        </div>
      </div>
    </GlassModal>
  );
}

function leadName(lead: LeadContact): string {
  const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
  return name || lead.email || "Unknown lead";
}
