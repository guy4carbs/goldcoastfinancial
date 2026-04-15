import { HCMSShell } from "./HCMSLayout";
import Content from "./HCMSHierarchy";
export default function HierarchyPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/hierarchy";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
