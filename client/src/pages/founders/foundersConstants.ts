export const FOUNDER_EMAILS = [
  "jack.cook@heritagels.org",
  "frank.carbonara@heritagels.org",
  "gaetano.carbonara@heritagels.org",
  "nick.gallagher@heritagels.org",
  "guy4carbs@gmail.com",
] as const;

export interface CapitalCategory { key: string; label: string; }
export const CAPITAL_CATEGORIES: CapitalCategory[] = [
  { key: "marketing_lead_gen", label: "Marketing & Lead Gen" },
  { key: "recruiting", label: "Recruiting" },
  { key: "tech", label: "Tech" },
  { key: "training", label: "Training" },
  { key: "bonuses", label: "Bonuses" },
  { key: "ops", label: "Ops" },
  { key: "cash_reserves", label: "Cash Reserves" },
  { key: "contingency", label: "Contingency" },
];

export type MAStageKey =
  | "prospect"
  | "intro"
  | "loi"
  | "diligence"
  | "closed_won"
  | "closed_lost"
  | "on_ice";

export interface MAStage { key: MAStageKey; label: string; }
export const MA_STAGES: MAStage[] = [
  { key: "prospect", label: "Prospect" },
  { key: "intro", label: "Intro" },
  { key: "loi", label: "LOI" },
  { key: "diligence", label: "Diligence" },
  { key: "closed_won", label: "Closed-Won" },
  { key: "closed_lost", label: "Closed-Lost" },
  { key: "on_ice", label: "On Ice" },
];

export type BoardStatusKey =
  | "proposed"
  | "under_review"
  | "approved"
  | "rejected"
  | "reversed"
  | "executed";

export interface BoardStatus { key: BoardStatusKey; label: string; }
export const BOARD_STATUSES: BoardStatus[] = [
  { key: "proposed", label: "Proposed" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "reversed", label: "Reversed" },
  { key: "executed", label: "Executed" },
];

export type BrandKey = "gc" | "heritage" | "both";
export const BRAND_COLORS: Record<BrandKey, string> = {
  gc: "#C4975A",
  heritage: "#EA580C",
  both: "#D9D6D0",
};

export const BRAND_LABELS: Record<BrandKey, string> = {
  gc: "Gold Coast",
  heritage: "Heritage",
  both: "Both",
};
