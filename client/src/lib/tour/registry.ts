import type { TourConfig, TourRole } from "./types";

// Agent Lounge — 29 tours, ordered to match the lounge sidebar
import { agentDashboardTour } from "./tours/agent/dashboard";
import { agentPerformanceTour } from "./tours/agent/performance";
import { agentLeadInboxTour } from "./tours/agent/lead-inbox";
import { agentCalendarTour } from "./tours/agent/calendar";
import { agentBookOfBusinessTour } from "./tours/agent/book-of-business";
import { agentDealsTour } from "./tours/agent/deals";
import { agentClientsTour } from "./tours/agent/clients";
import { agentClaimsTour } from "./tours/agent/claims";
import { agentMemberCardsTour } from "./tours/agent/member-cards";
import { agentBusinessCardTour } from "./tours/agent/business-card";
import { agentWebsiteTour } from "./tours/agent/website";
import { agentDialerTour } from "./tours/agent/dialer";
import { agentCommunicationsTour } from "./tours/agent/communications";
import { agentScriptsTour } from "./tours/agent/scripts";
import { agentRecruitingTour } from "./tours/agent/recruiting";
import { agentQuotesTour } from "./tours/agent/quotes";
import { agentDataEncryptionTour } from "./tours/agent/data-encryption";
import { agentResourcesTour } from "./tours/agent/resources";
import { agentAvatarCouncilTour } from "./tours/agent/avatar-council";
import { agentLeaderboardTour } from "./tours/agent/leaderboard";
import { agentAchievementsTour } from "./tours/agent/achievements";
import { agentHierarchyTour } from "./tours/agent/hierarchy";
import { agentCommissionsTour } from "./tours/agent/commissions";
import { agentLeadMarketplaceTour } from "./tours/agent/lead-marketplace";
import { agentTrainingTour } from "./tours/agent/training";
import { agentGuidelinesTour } from "./tours/agent/guidelines";
import { agentIdeasTour } from "./tours/agent/ideas";
import { agentSettingsTour } from "./tours/agent/settings";
import { agentHelpTour } from "./tours/agent/help";

// CRM — 12 tours
import { crmDashboardTour } from "./tours/crm/dashboard";
import { crmPipelineTour } from "./tours/crm/pipeline";
import { crmContactsTour } from "./tours/crm/contacts";
import { crmClientsTour } from "./tours/crm/clients";
import { crmLeadProfileTour } from "./tours/crm/lead-profile";
import { crmHistoryTour } from "./tours/crm/history";
import { crmSegmentsTour } from "./tours/crm/segments";
import { crmImportExportTour } from "./tours/crm/import-export";
import { crmLobbyLandingTour } from "./tours/crm/lobby-landing";
import { crmLobbyLayoutTour } from "./tours/crm/lobby-layout";
import { crmLobbyImportTour } from "./tours/crm/lobby-import";
import { crmLobbyExportTour } from "./tours/crm/lobby-export";

const ALL: TourConfig[] = [
  // Agent Lounge chain (sidebar order; help is the celebration finale)
  agentDashboardTour,
  agentPerformanceTour,
  agentLeadInboxTour,
  agentCalendarTour,
  agentBookOfBusinessTour,
  agentDealsTour,
  agentClientsTour,
  agentClaimsTour,
  agentMemberCardsTour,
  agentBusinessCardTour,
  agentWebsiteTour,
  agentDialerTour,
  agentCommunicationsTour,
  agentScriptsTour,
  agentRecruitingTour,
  agentQuotesTour,
  agentDataEncryptionTour,
  agentResourcesTour,
  agentAvatarCouncilTour,
  agentLeaderboardTour,
  agentAchievementsTour,
  agentHierarchyTour,
  agentCommissionsTour,
  agentLeadMarketplaceTour,
  agentTrainingTour,
  agentGuidelinesTour,
  agentIdeasTour,
  agentSettingsTour,
  agentHelpTour,
  // CRM chain
  crmDashboardTour,
  crmPipelineTour,
  crmContactsTour,
  crmClientsTour,
  crmLeadProfileTour,
  crmHistoryTour,
  crmSegmentsTour,
  crmImportExportTour,
  crmLobbyLandingTour,
  crmLobbyLayoutTour,
  crmLobbyImportTour,
  crmLobbyExportTour,
];

const BY_ID = new Map<string, TourConfig>(ALL.map((t) => [t.id, t]));

export function getTour(id: string): TourConfig | undefined {
  return BY_ID.get(id);
}

export function listTours(role?: TourRole): TourConfig[] {
  return role ? ALL.filter((t) => t.role === role) : ALL;
}

export function getTourForRoute(pathname: string, role: TourRole): TourConfig | undefined {
  const candidates = ALL.filter((t) => t.role === role && pathname.startsWith(t.page));
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => b.page.length - a.page.length)[0];
}
