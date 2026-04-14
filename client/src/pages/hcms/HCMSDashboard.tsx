import { GCPageHeader } from "@/components/gc";
export default function HCMSDashboard() {
  return (
    <div>
      <GCPageHeader title="HCMS Dashboard" subtitle="Hierarchy & Compensation Management System" accentUnderline />
      <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginTop: "var(--gc-space-4)" }}>Welcome to the HCMS platform. Use the sidebar to navigate.</p>
    </div>
  );
}
