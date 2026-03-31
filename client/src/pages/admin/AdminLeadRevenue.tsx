import { AdminLoungeLayout } from './AdminLoungeLayout';
import LeadRevenueCore from '@/components/lead-revenue/LeadRevenueCore';

export default function AdminLeadRevenue() {
  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Lead Revenue' }]}>
      <LeadRevenueCore
        variant="admin"
        gradientCSS="linear-gradient(135deg, #475569 0%, #334155 50%, #64748b 100%)"
        accentColor="#64748b"
        accentLight="#f8fafc"
      />
    </AdminLoungeLayout>
  );
}
