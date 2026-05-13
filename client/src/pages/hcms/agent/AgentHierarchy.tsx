import HCMSHierarchy from "@/pages/hcms/HCMSHierarchy";

/**
 * Agent-side hierarchy page.
 *
 * Now re-uses the unified HCMSHierarchy component. The component decides
 * what to fetch based on the viewer's role: founder/owner/system_admin
 * see the full tree, everyone else (including this agent route) sees
 * only themselves + their downlines via /api/hcms/hierarchy/my-subtree.
 * No upline card — the viewer is the root of their visible hierarchy.
 */
export default function AgentHierarchy() {
  return <HCMSHierarchy />;
}
