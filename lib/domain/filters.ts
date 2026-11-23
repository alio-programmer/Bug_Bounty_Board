import {
  BUG_STATUSES,
  CATEGORIES,
  QUADRANTS,
  SEVERITIES,
  type BugStatus,
  type Category,
  type Effort,
  type Quadrant,
  type Severity,
} from "./constants";
import { bugQuadrant } from "./priority";
import type { Bug } from "./types";

export interface BugFilters {
  q: string;
  severity: Severity[];
  effort: Effort[];
  category: Category[];
  status: BugStatus[];
  quadrant: Quadrant[];
}

export const EMPTY_FILTERS: BugFilters = {
  q: "",
  severity: [],
  effort: [],
  category: [],
  status: [],
  quadrant: [],
};

const VALID = {
  severity: SEVERITIES as readonly string[],
  effort: ["1", "2", "3", "4", "5"] as readonly string[],
  category: CATEGORIES as readonly string[],
  status: BUG_STATUSES as readonly string[],
  quadrant: QUADRANTS as readonly string[],
};

function parseList<T extends string>(
  raw: string | null,
  allowed: readonly string[],
): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is T => allowed.includes(value));
}

export function parseFilters(params: URLSearchParams): BugFilters {
  return {
    q: params.get("q")?.trim() ?? "",
    severity: parseList<Severity>(params.get("severity"), VALID.severity),
    effort: parseList<string>(params.get("effort"), VALID.effort).map(
      (value) => Number(value) as Effort,
    ),
    category: parseList<Category>(params.get("category"), VALID.category),
    status: parseList<BugStatus>(params.get("status"), VALID.status),
    quadrant: parseList<Quadrant>(params.get("quadrant"), VALID.quadrant),
  };
}

export function writeFilters(
  params: URLSearchParams,
  filters: BugFilters,
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of [
    "q",
    "severity",
    "effort",
    "category",
    "status",
    "quadrant",
  ] as const) {
    const value = filters[key];
    const serialized = Array.isArray(value) ? value.join(",") : value.trim();
    if (serialized) next.set(key, serialized);
    else next.delete(key);
  }
  return next;
}

export function filterBugs(
  bugs: readonly Bug[],
  filters: BugFilters,
): Bug[] {
  const query = filters.q.toLowerCase();
  return bugs.filter((bug) => {
    if (
      query &&
      !`${bug.title} ${bug.description} ${bug.id}`
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    if (filters.severity.length && !filters.severity.includes(bug.severity)) {
      return false;
    }
    if (filters.effort.length && !filters.effort.includes(bug.effort)) {
      return false;
    }
    if (filters.category.length && !filters.category.includes(bug.category)) {
      return false;
    }
    if (filters.status.length && !filters.status.includes(bug.status)) {
      return false;
    }
    if (
      filters.quadrant.length &&
      !filters.quadrant.includes(bugQuadrant(bug))
    ) {
      return false;
    }
    return true;
  });
}

export function hasActiveFilters(filters: BugFilters): boolean {
  return Boolean(
    filters.q ||
      filters.severity.length ||
      filters.effort.length ||
      filters.category.length ||
      filters.status.length ||
      filters.quadrant.length,
  );
}

export function activeFilterCount(filters: BugFilters): number {
  return (
    (filters.q ? 1 : 0) +
    filters.severity.length +
    filters.effort.length +
    filters.category.length +
    filters.status.length +
    filters.quadrant.length
  );
}
