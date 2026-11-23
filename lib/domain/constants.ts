export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EFFORTS = [1, 2, 3, 4, 5] as const;
export type Effort = (typeof EFFORTS)[number];

export const CATEGORIES = [
  "ui",
  "backend",
  "performance",
  "security",
  "data",
  "infra",
  "docs",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const BUG_STATUSES = ["open", "in_progress", "fixed", "wontfix"] as const;
export type BugStatus = (typeof BUG_STATUSES)[number];

export const QUADRANTS = ["quick_win", "big_bet", "fill_in", "time_sink"] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export interface SeverityMeta {
  label: string;
  weight: number;
  color: string;
  hint: string;
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  critical: {
    label: "Critical",
    weight: 4,
    color: "var(--critical)",
    hint: "Outage, data loss, or exposed security",
  },
  high: {
    label: "High",
    weight: 3,
    color: "var(--high)",
    hint: "Major feature broken, no workaround",
  },
  medium: {
    label: "Medium",
    weight: 2,
    color: "var(--medium)",
    hint: "Degraded, but a workaround exists",
  },
  low: {
    label: "Low",
    weight: 1,
    color: "var(--low)",
    hint: "Cosmetic or minor annoyance",
  },
};

export const EFFORT_META: Record<
  Effort,
  { label: string; short: string; hint: string; days: string }
> = {
  1: { label: "Trivial", short: "XS", hint: "Under 30 minutes", days: "< 30m" },
  2: { label: "Small", short: "S", hint: "About half a day", days: "~0.5d" },
  3: { label: "Medium", short: "M", hint: "One to two days", days: "1–2d" },
  4: { label: "Large", short: "L", hint: "Three to five days", days: "3–5d" },
  5: { label: "Epic", short: "XL", hint: "A week or more", days: "1w+" },
};

export interface CategoryMeta {
  label: string;
  color: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  ui: { label: "UI / UX", color: "var(--cat-ui)" },
  backend: { label: "Backend", color: "var(--cat-backend)" },
  performance: { label: "Performance", color: "var(--cat-performance)" },
  security: { label: "Security", color: "var(--cat-security)" },
  data: { label: "Data", color: "var(--cat-data)" },
  infra: { label: "Infrastructure", color: "var(--cat-infra)" },
  docs: { label: "Docs", color: "var(--cat-docs)" },
  other: { label: "Other", color: "var(--cat-other)" },
};

export interface StatusMeta {
  label: string;
  color: string;
}

export const STATUS_META: Record<BugStatus, StatusMeta> = {
  open: { label: "Open", color: "var(--status-open)" },
  in_progress: { label: "In progress", color: "var(--status-progress)" },
  fixed: { label: "Fixed", color: "var(--status-fixed)" },
  wontfix: { label: "Won't fix", color: "var(--status-wontfix)" },
};

export interface QuadrantMeta {
  label: string;
  short: string;
  description: string;
  action: string;
  color: string;
}

export const QUADRANT_META: Record<Quadrant, QuadrantMeta> = {
  quick_win: {
    label: "Quick wins",
    short: "Quick win",
    description: "High gain · low effort",
    action: "Do these first",
    color: "var(--quad-quick)",
  },
  big_bet: {
    label: "Big bets",
    short: "Big bet",
    description: "High gain · high effort",
    action: "Plan and staff",
    color: "var(--quad-big)",
  },
  fill_in: {
    label: "Fill-ins",
    short: "Fill-in",
    description: "Low gain · low effort",
    action: "Batch when idle",
    color: "var(--quad-fill)",
  },
  time_sink: {
    label: "Time sinks",
    short: "Time sink",
    description: "Low gain · high effort",
    action: "Deprioritize",
    color: "var(--quad-sink)",
  },
};

export const QUADRANT_RANK: Record<Quadrant, number> = {
  quick_win: 0,
  big_bet: 1,
  fill_in: 2,
  time_sink: 3,
};

export const HIGH_GAIN_SEVERITIES: readonly Severity[] = ["critical", "high"];
