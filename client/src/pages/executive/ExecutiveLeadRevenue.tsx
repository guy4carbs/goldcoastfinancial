import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { EXECUTIVE_GRADIENT_CSS } from './executiveConstants';
import LeadRevenueCore from '@/components/lead-revenue/LeadRevenueCore';

export function ExecutiveLeadRevenue() {
  return (
    <ExecutiveLoungeLayout>
      <LeadRevenueCore
        variant="executive"
        gradientCSS={EXECUTIVE_GRADIENT_CSS}
        accentColor="#ea580c"
        accentLight="#fff7ed"
      />
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveLeadRevenue;
