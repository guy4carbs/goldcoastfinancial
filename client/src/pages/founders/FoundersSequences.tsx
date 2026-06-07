/**
 * FoundersSequences — email automation hub for the Founders Lounge.
 *
 * Two tabs:
 *   • Sequences — list with status + enrollment counts; create/edit with a
 *     step builder (template picker + delays); enroll a lead (CRM search);
 *     view enrollments with pause/resume/unenroll + per-enrollment history.
 *   • Templates — CRUD for reusable email templates.
 *
 * Restyled from the heritage-app sequences admin to main's Gold Coast (GC)
 * design language. Backend contracts owned by Forge (/api/sequences,
 * /api/email-templates).
 */

import { useState } from "react";
import { Mail } from "lucide-react";
import {
  GCPageHeader,
  GCTabs,
  GCTabsList,
  GCTabsTrigger,
  GCTabsContent,
} from "@/components/gc";
import { SequencesTab } from "@/components/founders/sequences/SequencesTab";
import { TemplatesTab } from "@/components/founders/sequences/TemplatesTab";

export default function FoundersSequences() {
  const [tab, setTab] = useState("sequences");

  return (
    <div>
      <GCPageHeader
        title="Email Sequences"
        subtitle="Automate lead nurture with multi-step drip campaigns and reusable templates"
        accentUnderline
        actions={
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)",
              color: "var(--gc-gold)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 500,
            }}
          >
            <Mail className="w-4 h-4" />
            Drip Automation
          </span>
        }
      />

      <GCTabs value={tab} onValueChange={setTab} className="mt-6">
        <GCTabsList>
          <GCTabsTrigger value="sequences">Sequences</GCTabsTrigger>
          <GCTabsTrigger value="templates">Templates</GCTabsTrigger>
        </GCTabsList>

        <GCTabsContent value="sequences">
          <SequencesTab />
        </GCTabsContent>
        <GCTabsContent value="templates">
          <TemplatesTab />
        </GCTabsContent>
      </GCTabs>
    </div>
  );
}
