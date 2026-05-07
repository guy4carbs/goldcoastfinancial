import type { TourConfig, TourRole } from "./types";
import { agentDashboardTour } from "./tours/agent/dashboard";
import { agentDocumentsTour } from "./tours/agent/documents";
import { agentLicensesTour } from "./tours/agent/licenses";
import { agentEoTour } from "./tours/agent/eo";
import { agentBankTour } from "./tours/agent/bank";
import { agentTrainingsTour } from "./tours/agent/trainings";
import { agentEmploymentTour } from "./tours/agent/employment";
import { agentDbaTour } from "./tours/agent/dba";
import { agentQuestionsTour } from "./tours/agent/questions";
import { agentCarriersTour } from "./tours/agent/carriers";
import { agentHierarchyTour } from "./tours/agent/hierarchy";
import { agentProfileTour } from "./tours/agent/profile";
import { agentRequestsTour } from "./tours/agent/requests";
import { adminAgentsListTour } from "./tours/admin/agents-list";
import { adminAgentDetailTour } from "./tours/admin/agent-detail";
import { adminHcmsDashboardTour } from "./tours/admin/hcms-dashboard";
import { adminCarriersTour } from "./tours/admin/carriers";
import { adminHierarchyTour } from "./tours/admin/hierarchy";
import { adminContractingOverviewTour } from "./tours/admin/contracting-overview";
import { adminContractingRequestsTour } from "./tours/admin/contracting-requests";
import { adminContractingBankTour } from "./tours/admin/contracting-bank";
import { adminContractingLicensesTour } from "./tours/admin/contracting-licenses";
import { adminContractingEoTour } from "./tours/admin/contracting-eo";
import { adminContractingTrainingsTour } from "./tours/admin/contracting-trainings";
import { adminContractingEmploymentTour } from "./tours/admin/contracting-employment";
import { adminContractingDbaTour } from "./tours/admin/contracting-dba";
import { adminContractingQuestionsTour } from "./tours/admin/contracting-questions";
import { financeDashboardTour } from "./tours/finance/dashboard";
import { financeRevenueTour } from "./tours/finance/revenue";
import { financeOverridesTour } from "./tours/finance/overrides";
import { financeTransactionsTour } from "./tours/finance/transactions";
import { financeCashflowTour } from "./tours/finance/cashflow";
import { financeChargebacksTour } from "./tours/finance/chargebacks";
import { financeReconciliationTour } from "./tours/finance/reconciliation";
import { financeStatementsTour } from "./tours/finance/statements";
import { financeReportsTour } from "./tours/finance/reports";
import { founderDashboardTour } from "./tours/founder/dashboard";
import { founderRevenueTour } from "./tours/founder/revenue";
import { founderHierarchyTour } from "./tours/founder/hierarchy";
import { founderGrowthTour } from "./tours/founder/growth";
import { founderBookTour } from "./tours/founder/book";
import { founderTeamPerformanceTour } from "./tours/founder/team-performance";
import { founderLeadDistributionTour } from "./tours/founder/lead-distribution";
import { founderAgencyManagementTour } from "./tours/founder/agency-management";
import { founderProfitSplitTour } from "./tours/founder/profit-split";
import { founderAccessTour } from "./tours/founder/access";
import { founderViewAsTour } from "./tours/founder/view-as";
import { founderSettingsTour } from "./tours/founder/settings";

const ALL: TourConfig[] = [
  agentDashboardTour,
  agentDocumentsTour,
  agentLicensesTour,
  agentEoTour,
  agentBankTour,
  agentTrainingsTour,
  agentEmploymentTour,
  agentDbaTour,
  agentQuestionsTour,
  agentCarriersTour,
  agentHierarchyTour,
  agentProfileTour,
  agentRequestsTour,
  adminHcmsDashboardTour,
  adminAgentsListTour,
  adminAgentDetailTour,
  adminCarriersTour,
  adminHierarchyTour,
  adminContractingOverviewTour,
  adminContractingRequestsTour,
  adminContractingBankTour,
  adminContractingLicensesTour,
  adminContractingEoTour,
  adminContractingTrainingsTour,
  adminContractingEmploymentTour,
  adminContractingDbaTour,
  adminContractingQuestionsTour,
  // Finance chain — 9 tours, /finance through /finance/reports, celebration finale
  financeDashboardTour,
  financeRevenueTour,
  financeOverridesTour,
  financeTransactionsTour,
  financeCashflowTour,
  financeChargebacksTour,
  financeReconciliationTour,
  financeStatementsTour,
  financeReportsTour,
  // Founders chain — 12 tours, /founders through /founders/settings, celebration finale
  founderDashboardTour,
  founderRevenueTour,
  founderHierarchyTour,
  founderGrowthTour,
  founderBookTour,
  founderTeamPerformanceTour,
  founderLeadDistributionTour,
  founderAgencyManagementTour,
  founderProfitSplitTour,
  founderAccessTour,
  founderViewAsTour,
  founderSettingsTour,
];

const BY_ID = new Map<string, TourConfig>(ALL.map((t) => [t.id, t]));

export function getTour(id: string): TourConfig | undefined {
  return BY_ID.get(id);
}

export function listTours(role?: TourRole): TourConfig[] {
  return role ? ALL.filter((t) => t.role === role) : ALL;
}

export function getTourForRoute(pathname: string, role: TourRole): TourConfig | undefined {
  // prefer longest-matching page prefix
  const candidates = ALL.filter((t) => t.role === role && pathname.startsWith(t.page));
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => b.page.length - a.page.length)[0];
}
