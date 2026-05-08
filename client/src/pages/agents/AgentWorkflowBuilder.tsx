/**
 * Agent Workflow Builder Page
 * Full-page visual workflow builder within Agent Lounge
 */

import { useParams } from "wouter";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { TOUR } from "@/lib/tour/selectors";

export default function AgentWorkflowBuilder() {
  const params = useParams();
  const workflowId = params.workflowId;

  // Layout constants: Header 64px, Main padding 24px (negated with -m-6)
  // Height = 100vh - 64px (header)
  return (
    <AgentLoungeLayout>
      <motion.div
        data-tour-id={TOUR.AGENT.WORKFLOWS.HEADER}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="-m-6"
        style={{
          height: 'calc(100vh - 64px)',
        }}
      >
        <motion.div data-tour-id={TOUR.AGENT.WORKFLOWS.CANVAS} variants={fadeInUp} className="h-full">
          <WorkflowBuilder workflowId={workflowId} />
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
