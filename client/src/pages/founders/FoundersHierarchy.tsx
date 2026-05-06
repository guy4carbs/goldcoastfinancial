import HCMSHierarchy from "@/pages/hcms/HCMSHierarchy";

/**
 * The Founders Hierarchy page is a 1:1 of the HCMS admin Hierarchy page —
 * same React Flow tree, same stats, same data sources (/api/hcms/hierarchy/tree
 * + /api/hcms/agents). We render HCMSHierarchy directly so any future HCMS
 * hierarchy improvements propagate automatically to the Founders Lounge
 * without duplicate code.
 */
export default function FoundersHierarchy() {
  return <HCMSHierarchy />;
}
