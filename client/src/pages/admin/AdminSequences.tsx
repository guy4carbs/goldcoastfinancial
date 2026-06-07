/**
 * Admin Sequences — email drip-campaign management.
 *
 * Two tabs: Sequences (CRUD + enroll + enrollments/history) and Templates
 * (CRUD + seed starters). Heritage-branded, cloned from AdminNewsletter chrome.
 *
 * Route gating is wired by Atlas in App.tsx — see report for recommendation.
 */

import { useState } from "react";
import { Workflow, Plus, Layers, Users, FileText } from "lucide-react";
import { RADIUS, TYPE } from "@/lib/heritageDesignSystem";
import {
  AdminPageHero,
  AdminStaggerContainer,
  AdminStatCard,
  AdminStatCardGrid,
} from "@/components/admin/AdminHeritagePrimitives";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminLoungeLayout } from "./AdminLoungeLayout";
import { useSequences, type Sequence } from "@/hooks/useSequences";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { SequencesTable } from "@/components/admin/sequences/SequencesTable";
import { SequenceEditorDrawer } from "@/components/admin/sequences/SequenceEditorDrawer";
import { EnrollLeadModal } from "@/components/admin/sequences/EnrollLeadModal";
import { EnrollmentsDrawer } from "@/components/admin/sequences/EnrollmentsDrawer";
import { TemplatesTab } from "@/components/admin/sequences/TemplatesTab";

export default function AdminSequences() {
  const { data: sequences = [], isLoading: sequencesLoading } = useSequences();
  const { data: templates = [] } = useEmailTemplates();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [enrollSequence, setEnrollSequence] = useState<Sequence | null>(null);
  const [enrollmentsSequence, setEnrollmentsSequence] = useState<Sequence | null>(null);

  const totalSequences = sequences.length;
  const activeEnrollments = sequences.reduce((sum, s) => sum + (s.activeEnrollments ?? 0), 0);
  const templatesCount = templates.length;

  const openNew = () => {
    setEditingSequence(null);
    setEditorOpen(true);
  };
  const openEdit = (seq: Sequence) => {
    setEditingSequence(seq);
    setEditorOpen(true);
  };

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: "Sequences" }]}>
      <AdminStaggerContainer>
        <AdminPageHero
          icon={Workflow}
          title="Email Sequences"
          subtitle="Build drip campaigns and nurture leads automatically"
          actions={
            <button
              onClick={openNew}
              style={{
                padding: "8px 16px",
                borderRadius: RADIUS.button,
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                fontSize: TYPE.meta,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Sequence</span>
            </button>
          }
        />

        <AdminStatCardGrid cols={3}>
          <AdminStatCard icon={Layers} iconColor="text-violet-500" value={totalSequences} label="Total Sequences" />
          <AdminStatCard
            icon={Users}
            iconColor="text-green-500"
            value={activeEnrollments}
            label="Active Enrollments"
          />
          <AdminStatCard icon={FileText} iconColor="text-blue-500" value={templatesCount} label="Templates" />
        </AdminStatCardGrid>

        <Tabs defaultValue="sequences" className="w-full">
          <TabsList>
            <TabsTrigger value="sequences">Sequences</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="sequences">
            <SequencesTable
              sequences={sequences}
              isLoading={sequencesLoading}
              onNew={openNew}
              onEdit={openEdit}
              onEnroll={setEnrollSequence}
              onViewEnrollments={setEnrollmentsSequence}
            />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesTab />
          </TabsContent>
        </Tabs>
      </AdminStaggerContainer>

      {editorOpen && (
        <SequenceEditorDrawer sequence={editingSequence} onClose={() => setEditorOpen(false)} />
      )}

      {enrollSequence && (
        <EnrollLeadModal sequence={enrollSequence} onClose={() => setEnrollSequence(null)} />
      )}

      {enrollmentsSequence && (
        <EnrollmentsDrawer sequence={enrollmentsSequence} onClose={() => setEnrollmentsSequence(null)} />
      )}
    </AdminLoungeLayout>
  );
}
