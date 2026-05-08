// client/src/lib/tour/selectors.ts
// data-tour-id constants for the Heritage Agent Lounge + CRM walkthrough.

export const TOUR = {
  SHELL: {
    TOPBAR: "heritage-shell-topbar",
    APP_SWITCHER: "heritage-shell-app-switcher", // LoungeSwitcher dropdown
    SEARCH: "heritage-shell-search", // UniversalSearch / Cmd+K
    NOTIFICATIONS: "heritage-shell-notifications", // UnifiedNotificationSystem bell
    USER_MENU: "heritage-shell-user-menu",
    SIDEBAR: "heritage-shell-sidebar",
    TOUR_BUTTON: "heritage-shell-tour-button",
  },
  AGENT: {
    DASHBOARD: {
      HEADER: "agent-dashboard-header",
      HERO: "agent-dashboard-hero",
      LEAD_STATS: "agent-dashboard-lead-stats",
      ACTIVITY_FEED: "agent-dashboard-activity-feed",
      DAILY_CHALLENGE: "agent-dashboard-daily-challenge",
      STATE_MAP: "agent-dashboard-state-map",
    },
    CALENDAR: {
      HEADER: "agent-calendar-header",
      WEEK_VIEW: "agent-calendar-week-view",
      EVENT_LIST: "agent-calendar-event-list",
      PROVIDER_CONNECT: "agent-calendar-provider-connect",
      NEW_EVENT: "agent-calendar-new-event",
    },
    PERFORMANCE: {
      HEADER: "agent-performance-header",
      TABS: "agent-performance-tabs",
      TIME_PERIOD: "agent-performance-time-period",
      CHART: "agent-performance-chart",
      DOWNLOAD: "agent-performance-download",
    },
    DIALER: {
      HEADER: "agent-dialer-header",
      DIALPAD: "agent-dialer-dialpad",
      CONTACT_SEARCH: "agent-dialer-contact-search",
      CALL_HISTORY: "agent-dialer-call-history",
      POWER_QUEUE: "agent-dialer-power-queue",
      RECORDINGS: "agent-dialer-recordings",
    },
    COMMUNICATIONS: {
      HEADER: "agent-communications-header",
      TABS: "agent-communications-tabs",
      COMPOSE: "agent-communications-compose",
      INBOX: "agent-communications-inbox",
    },
    EMAIL: {
      HEADER: "agent-email-header",
      FOLDERS: "agent-email-folders",
      LIST: "agent-email-list",
      DETAIL: "agent-email-detail",
      COMPOSE: "agent-email-compose",
    },
    CHAT: {
      HEADER: "agent-chat-header",
      CHANNELS: "agent-chat-channels",
      MESSAGES: "agent-chat-messages",
      COMPOSER: "agent-chat-composer",
    },
    CLIENTS: {
      HEADER: "agent-clients-header",
      STATS: "agent-clients-stats",
      SEARCH: "agent-clients-search",
      GRID: "agent-clients-grid",
    },
    BOOK: {
      HEADER: "agent-book-header",
      STATS: "agent-book-stats",
      SEARCH: "agent-book-search",
      TABLE: "agent-book-table",
    },
    DEALS: {
      HEADER: "agent-deals-header",
      STATS: "agent-deals-stats",
      PERIOD: "agent-deals-period",
      FEED: "agent-deals-feed",
      LEADERBOARD: "agent-deals-leaderboard",
    },
    INBOX: {
      HEADER: "agent-inbox-header",
      STATS: "agent-inbox-stats",
      FILTERS: "agent-inbox-filters",
      LIST: "agent-inbox-list",
    },
    LEAD_MARKETPLACE: {
      HEADER: "agent-lead-marketplace-header",
      PRODUCT_FILTER: "agent-lead-marketplace-product",
      STATE_SELECTOR: "agent-lead-marketplace-state",
      GRID: "agent-lead-marketplace-grid",
      CART: "agent-lead-marketplace-cart",
    },
    QUOTES: {
      HEADER: "agent-quotes-header",
      STATS: "agent-quotes-stats",
      CREATE: "agent-quotes-create",
      TABS: "agent-quotes-tabs",
    },
    CLAIMS: {
      HEADER: "agent-claims-header",
      STATS: "agent-claims-stats",
      SEARCH: "agent-claims-search",
      TABLE: "agent-claims-table",
    },
    COMMISSIONS: {
      HEADER: "agent-commissions-header",
      STATS: "agent-commissions-stats",
      REQUEST: "agent-commissions-request",
      TIER_BAR: "agent-commissions-tier-bar",
      HISTORY: "agent-commissions-history",
    },
    HIERARCHY: {
      HEADER: "agent-hierarchy-header",
      STATS: "agent-hierarchy-stats",
      TREE: "agent-hierarchy-tree",
    },
    RECRUITING: {
      HEADER: "agent-recruiting-header",
      STATS: "agent-recruiting-stats",
      REFERRAL_LINK: "agent-recruiting-referral",
      FUNNEL: "agent-recruiting-funnel",
      DOWNLINE: "agent-recruiting-downline",
    },
    LEADERBOARD: {
      HEADER: "agent-leaderboard-header",
      TIME_RANGE: "agent-leaderboard-time-range",
      PODIUM: "agent-leaderboard-podium",
      TABLE: "agent-leaderboard-table",
    },
    ACHIEVEMENTS: {
      HEADER: "agent-achievements-header",
      FILTER_TABS: "agent-achievements-filters",
      GRID: "agent-achievements-grid",
    },
    SCRIPTS: {
      HEADER: "agent-scripts-header",
      CATEGORIES: "agent-scripts-categories",
      SEARCH: "agent-scripts-search",
      LIST: "agent-scripts-list",
    },
    WORKFLOWS: {
      HEADER: "agent-workflows-header",
      CANVAS: "agent-workflows-canvas",
      TOOLBOX: "agent-workflows-toolbox",
      PROPERTIES: "agent-workflows-properties",
    },
    AUTOMATIONS: {
      HEADER: "agent-automations-header",
      TABS: "agent-automations-tabs",
      STATS: "agent-automations-stats",
      LIST: "agent-automations-list",
    },
    MEMBER_CARDS: {
      HEADER: "agent-member-cards-header",
      STATS: "agent-member-cards-stats",
      GRID: "agent-member-cards-grid",
    },
    BUSINESS_CARD: {
      HEADER: "agent-business-card-header",
      PREVIEW: "agent-business-card-preview",
      EDIT_FORM: "agent-business-card-edit",
      SHARE: "agent-business-card-share",
    },
    WEBSITE: {
      HEADER: "agent-website-header",
      PREVIEW: "agent-website-preview",
      SETTINGS: "agent-website-settings",
      STATS: "agent-website-stats",
    },
    AVATAR_COUNCIL: {
      HEADER: "agent-avatar-council-header",
      AVATAR_SELECTOR: "agent-avatar-council-selector",
      MESSAGES: "agent-avatar-council-messages",
    },
    DATA_ENCRYPTION: {
      HEADER: "agent-data-encryption-header",
      SECURE_FIELDS: "agent-data-encryption-fields",
    },
    IDEAS: {
      HEADER: "agent-ideas-header",
      STATS: "agent-ideas-stats",
      FORM: "agent-ideas-form",
      LIST: "agent-ideas-list",
    },
    GETTING_STARTED: {
      HEADER: "agent-getting-started-header",
      CHECKLIST: "agent-getting-started-checklist",
      PROGRESS: "agent-getting-started-progress",
    },
    TRAINING: {
      HEADER: "agent-training-header",
      STATS: "agent-training-stats",
      TABLE: "agent-training-table",
      SCHEDULE: "agent-training-schedule",
    },
    RESOURCES: {
      HEADER: "agent-resources-header",
      PRODUCT_TABS: "agent-resources-tabs",
      DETAIL: "agent-resources-detail",
    },
    GUIDELINES: {
      HEADER: "agent-guidelines-header",
      CORE_VALUES: "agent-guidelines-values",
      EXPECTATIONS: "agent-guidelines-expectations",
      SCHEDULE: "agent-guidelines-schedule",
    },
    HELP: {
      HEADER: "agent-help-header",
      CATEGORIES: "agent-help-categories",
      ARTICLES: "agent-help-articles",
      SEARCH: "agent-help-search",
    },
    SETTINGS: {
      HEADER: "agent-settings-header",
      PROFILE: "agent-settings-profile",
      NOTIFICATIONS: "agent-settings-notifications",
      BANK: "agent-settings-bank",
      DANGER: "agent-settings-danger",
    },
    STUDY_FUNDAMENTALS: {
      HEADER: "agent-study-fundamentals-header",
      MODULES: "agent-study-fundamentals-modules",
    },
    STUDY_EXAM_PREP: {
      HEADER: "agent-study-exam-prep-header",
      TOPICS: "agent-study-exam-prep-topics",
    },
    STUDY_PRACTICE: {
      HEADER: "agent-study-practice-header",
      QUESTION: "agent-study-practice-question",
      TIMER: "agent-study-practice-timer",
    },
    STUDY_FLASHCARDS: {
      HEADER: "agent-study-flashcards-header",
      DECK: "agent-study-flashcards-deck",
      SHUFFLE: "agent-study-flashcards-shuffle",
    },
  },
  CRM: {
    DASHBOARD: {
      HEADER: "crm-dashboard-header",
      KPI_GRID: "crm-dashboard-kpi-grid",
      FUNNEL: "crm-dashboard-funnel",
      SOURCE_TABLE: "crm-dashboard-source-table",
      MONTHLY_GRID: "crm-dashboard-monthly",
    },
    PIPELINE: {
      HEADER: "crm-pipeline-header",
      SUMMARY_BAR: "crm-pipeline-summary",
      BOARD: "crm-pipeline-board",
      VIEW_TOGGLE: "crm-pipeline-view-toggle",
    },
    CONTACTS: {
      HEADER: "crm-contacts-header",
      SEARCH: "crm-contacts-search",
      FILTERS: "crm-contacts-filters",
      TABLE: "crm-contacts-table",
      BULK: "crm-contacts-bulk",
    },
    CLIENTS: {
      HEADER: "crm-clients-header",
      SUMMARY: "crm-clients-summary",
      TABLE: "crm-clients-table",
      RENEWALS: "crm-clients-renewals",
    },
    LEAD_PROFILE: {
      HEADER: "crm-lead-profile-header",
      CONTACT_INFO: "crm-lead-profile-contact",
      TIMELINE: "crm-lead-profile-timeline",
      AI_RECS: "crm-lead-profile-ai-recs",
      ACTION_BAR: "crm-lead-profile-action-bar",
    },
    HISTORY: {
      HEADER: "crm-history-header",
      SUMMARY: "crm-history-summary",
      FEED: "crm-history-feed",
      FILTERS: "crm-history-filters",
      TREND_CHART: "crm-history-trend",
    },
    SEGMENTS: {
      HEADER: "crm-segments-header",
      SEGMENT_GRID: "crm-segments-grid",
      TAG_CLOUD: "crm-segments-tags",
    },
    IMPORT_EXPORT: {
      HEADER: "crm-import-export-header",
      IMPORT_TAB: "crm-import-tab",
      EXPORT_TAB: "crm-export-tab",
      UPLOAD: "crm-import-upload",
      MAPPER: "crm-import-mapper",
      FIELD_SELECT: "crm-export-fields",
    },
    LOBBY_LANDING: {
      HEADER: "crm-lobby-landing-header",
      METRICS: "crm-lobby-landing-metrics",
      LOUNGE_GRID: "crm-lobby-landing-grid",
    },
    LOBBY_LAYOUT: {
      SIDEBAR: "crm-lobby-layout-sidebar",
      WELCOME: "crm-lobby-layout-welcome",
      SEARCH: "crm-lobby-layout-search",
    },
    LOBBY_IMPORT: {
      HEADER: "crm-lobby-import-header",
      DROP_ZONE: "crm-lobby-import-drop",
      MAPPING: "crm-lobby-import-mapping",
      HISTORY: "crm-lobby-import-history",
    },
    LOBBY_EXPORT: {
      HEADER: "crm-lobby-export-header",
      TYPE_SELECTOR: "crm-lobby-export-type",
      FORMAT: "crm-lobby-export-format",
      FIELDS: "crm-lobby-export-fields",
      FILTERS: "crm-lobby-export-filters",
    },
  },
} as const;

export function tourAttr(id: string | undefined) {
  return id ? ({ "data-tour-id": id } as const) : ({} as const);
}

export function tourSelector(id: string) {
  return `[data-tour-id="${id}"]`;
}
