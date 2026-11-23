import {
  HIGH_GAIN_SEVERITIES,
  QUADRANT_RANK,
  SEVERITY_META,
  type Effort,
  type Quadrant,
  type Severity,
} from "./constants";
import type { Bug } from "./types";

export function isHighGain(severity: Severity): boolean {
  return HIGH_GAIN_SEVERITIES.includes(severity);
}

export function isLowEffort(effort: Effort): boolean {
  return effort <= 2;
}

export function getQuadrant(severity: Severity, effort: Effort): Quadrant {
  const highGain = isHighGain(severity);
  const lowEffort = isLowEffort(effort);

  if (highGain && lowEffort) return "quick_win";
  if (highGain) return "big_bet";
  if (lowEffort) return "fill_in";
  return "time_sink";
}

export function bugQuadrant(bug: Pick<Bug, "severity" | "effort">): Quadrant {
  return getQuadrant(bug.severity, bug.effort);
}

/** Gain (severity weight) divided by effort. Higher means better return. */
export function priorityScore(
  severity: Severity,
  effort: Effort | number,
): number {
  return SEVERITY_META[severity].weight / effort;
}

export function formatPriorityScore(
  severity: Severity,
  effort: Effort | number,
): string {
  const score = priorityScore(severity, effort);
  return Number.isInteger(score) ? score.toFixed(1) : score.toFixed(2);
}

/** Quick wins first, then severity, then lowest effort, then newest. */
export function compareByPriority(a: Bug, b: Bug): number {
  const quadrantDiff = QUADRANT_RANK[bugQuadrant(a)] - QUADRANT_RANK[bugQuadrant(b)];
  if (quadrantDiff !== 0) return quadrantDiff;

  const severityDiff =
    SEVERITY_META[b.severity].weight - SEVERITY_META[a.severity].weight;
  if (severityDiff !== 0) return severityDiff;

  const effortDiff = a.effort - b.effort;
  if (effortDiff !== 0) return effortDiff;

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function rankBugs(bugs: readonly Bug[]): Bug[] {
  return [...bugs].sort(compareByPriority);
}

export function sortByNewest(bugs: readonly Bug[]): Bug[] {
  return [...bugs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function isPending(status: Bug["status"]): boolean {
  return status === "open" || status === "in_progress";
}
