import { HCMSShell } from "./HCMSLayout";
import Content from "./HCMSCarriers";
export default function CarriersPage() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/hcms/carriers";
  return <HCMSShell activePath={path}><Content /></HCMSShell>;
}
