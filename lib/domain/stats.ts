import {
  BUG_STATUSES,
  CATEGORIES,
  CATEGORY_META,
  QUADRANTS,
  QUADRANT_META,
  SEVERITIES,
  SEVERITY_META,
  STATUS_META,
  type BugStatus,
  type Category,
  type Quadrant,
  type Severity,
} from "./constants";
import { bugQuadrant, isPending } from "./priority";
import type { Bug } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface BoardSummary {
  total: number;
  pending: number;
  openCritical: number;
  quickWins: number;
  fixedThisWeek: number;
  newThisWeek: number;
  averageAgeDays: number;
  lastUpdatedAt: string | null;
  bySeverity: Record<Severity, number>;
  byCategory: Record<Category, number>;
  byStatus: Record<BugStatus, number>;
  byQuadrant: Record<Quadrant, number>;
}

function zeroed<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

export function summarize(bugs: readonly Bug[], now = Date.now()): BoardSummary {
  const bySeverity = zeroed(SEVERITIES);
  const byCategory = zeroed(CATEGORIES);
  const byStatus = zeroed(BUG_STATUSES);
  const byQuadrant = zeroed(QUADRANTS);

  let pending = 0;
  let openCritical = 0;
  let quickWins = 0;
  let fixedThisWeek = 0;
  let newThisWeek = 0;
  let ageTotal = 0;
  let ageCount = 0;
  let lastUpdatedAt: string | null = null;

  for (const bug of bugs) {
    const created = new Date(bug.createdAt).getTime();
    const updated = new Date(bug.updatedAt).getTime();
    const quadrant = bugQuadrant(bug);

    bySeverity[bug.severity] += 1;
    byCategory[bug.category] += 1;
    byStatus[bug.status] += 1;
    byQuadrant[quadrant] += 1;

    if (isPending(bug.status)) {
      pending += 1;
      ageTotal += Math.max(0, now - created);
      ageCount += 1;
    }
    if (bug.severity === "critical" && isPending(bug.status)) openCritical += 1;
    if (quadrant === "quick_win" && isPending(bug.status)) quickWins += 1;
    if (bug.status === "fixed" && now - updated <= 7 * DAY_MS) fixedThisWeek += 1;
    if (now - created <= 7 * DAY_MS) newThisWeek += 1;
    if (!lastUpdatedAt || updated > new Date(lastUpdatedAt).getTime()) {
      lastUpdatedAt = bug.updatedAt;
    }
  }

  return {
    total: bugs.length,
    pending,
    openCritical,
    quickWins,
    fixedThisWeek,
    newThisWeek,
    averageAgeDays: ageCount === 0 ? 0 : Math.round(ageTotal / ageCount / DAY_MS),
    lastUpdatedAt,
    bySeverity,
    byCategory,
    byStatus,
    byQuadrant,
  };
}

export interface ChartDatum {
  key: string;
  label: string;
  value: number;
  color: string;
}

export function severityData(bugs: readonly Bug[]): ChartDatum[] {
  return SEVERITIES.map((severity) => ({
    key: severity,
    label: SEVERITY_META[severity].label,
    value: bugs.filter((bug) => bug.severity === severity).length,
    color: SEVERITY_META[severity].color,
  })).filter((datum) => datum.value > 0);
}

export function statusData(bugs: readonly Bug[]): ChartDatum[] {
  return BUG_STATUSES.map((status) => ({
    key: status,
    label: STATUS_META[status].label,
    value: bugs.filter((bug) => bug.status === status).length,
    color: STATUS_META[status].color,
  })).filter((datum) => datum.value > 0);
}

export function categoryData(bugs: readonly Bug[]): ChartDatum[] {
  return CATEGORIES.map((category) => ({
    key: category,
    label: CATEGORY_META[category].label,
    value: bugs.filter((bug) => bug.category === category).length,
    color: CATEGORY_META[category].color,
  }))
    .filter((datum) => datum.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

export function quadrantData(bugs: readonly Bug[]): ChartDatum[] {
  return QUADRANTS.map((quadrant) => ({
    key: quadrant,
    label: QUADRANT_META[quadrant].label,
    value: bugs.filter((bug) => bugQuadrant(bug) === quadrant).length,
    color: QUADRANT_META[quadrant].color,
  }));
}

export interface TrendDatum {
  date: string;
  label: string;
  fullLabel: string;
  count: number;
}

/** Bugs filed per day for the last `days` days, oldest first. */
export function filingTrend(
  bugs: readonly Bug[],
  days = 14,
  now = Date.now(),
): TrendDatum[] {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  const buckets: TrendDatum[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(end);
    day.setDate(end.getDate() - index);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = bugs.filter((bug) => {
      const created = new Date(bug.createdAt).getTime();
      return created >= day.getTime() && created < next.getTime();
    }).length;

    buckets.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      fullLabel: day.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      count,
    });
  }
  return buckets;
}
