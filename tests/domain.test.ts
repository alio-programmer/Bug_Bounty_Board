import { describe, expect, it } from "vitest";
import type { Bug } from "../lib/domain/types";
import {
  getQuadrant,
  priorityScore,
  rankBugs,
} from "../lib/domain/priority";
import { filterBugs, parseFilters, writeFilters } from "../lib/domain/filters";
import { summarize, filingTrend } from "../lib/domain/stats";
import { createBugSchema } from "../lib/validation";

const NOW = new Date("2026-01-15T12:00:00.000Z").getTime();
const DAY = 24 * 60 * 60 * 1000;

function bug(overrides: Partial<Bug> = {}): Bug {
  return {
    id: "bug_test",
    title: "Test bug",
    description: "",
    severity: "medium",
    effort: 3,
    category: "backend",
    status: "open",
    reportedBy: "human",
    createdAt: new Date(NOW - DAY).toISOString(),
    updatedAt: new Date(NOW - DAY).toISOString(),
    ...overrides,
  };
}

describe("priority quadrants", () => {
  it("classifies high gain and low effort as quick wins", () => {
    expect(getQuadrant("critical", 1)).toBe("quick_win");
    expect(getQuadrant("high", 2)).toBe("quick_win");
  });

  it("classifies high gain and high effort as big bets", () => {
    expect(getQuadrant("critical", 3)).toBe("big_bet");
    expect(getQuadrant("high", 5)).toBe("big_bet");
  });

  it("classifies low gain and low effort as fill-ins", () => {
    expect(getQuadrant("low", 1)).toBe("fill_in");
    expect(getQuadrant("medium", 2)).toBe("fill_in");
  });

  it("classifies low gain and high effort as time sinks", () => {
    expect(getQuadrant("low", 4)).toBe("time_sink");
    expect(getQuadrant("medium", 3)).toBe("time_sink");
  });

  it("scores gain divided by effort", () => {
    expect(priorityScore("critical", 2)).toBe(2);
    expect(priorityScore("critical", 4)).toBe(1);
    expect(priorityScore("low", 1)).toBe(1);
    expect(priorityScore("medium", 4)).toBe(0.5);
  });

  it("ranks quick wins before big bets before fill-ins before time sinks", () => {
    const timeSink = bug({ id: "time", severity: "low", effort: 4 });
    const fillIn = bug({ id: "fill", severity: "low", effort: 1 });
    const bigBet = bug({ id: "big", severity: "critical", effort: 4 });
    const quickWin = bug({ id: "quick", severity: "high", effort: 1 });

    expect(rankBugs([timeSink, fillIn, bigBet, quickWin]).map((b) => b.id)).toEqual([
      "quick",
      "big",
      "fill",
      "time",
    ]);
  });
});

describe("filters", () => {
  const bugs = [
    bug({
      id: "critical-ui",
      title: "Checkout crash",
      severity: "critical",
      effort: 1,
      category: "ui",
    }),
    bug({
      id: "high-backend",
      title: "Webhook retries duplicate",
      severity: "high",
      effort: 4,
      category: "backend",
      status: "in_progress",
    }),
    bug({
      id: "low-docs",
      title: "Missing API docs",
      severity: "low",
      effort: 2,
      category: "docs",
      status: "fixed",
    }),
  ];

  it("filters by text, category, status, and derived quadrant", () => {
    expect(filterBugs(bugs, { ...emptyFilters(), q: "webhook" })).toHaveLength(1);
    expect(
      filterBugs(bugs, { ...emptyFilters(), category: ["ui"] })[0]?.id,
    ).toBe("critical-ui");
    expect(
      filterBugs(bugs, { ...emptyFilters(), status: ["fixed"] })[0]?.id,
    ).toBe("low-docs");
    expect(
      filterBugs(bugs, { ...emptyFilters(), quadrant: ["big_bet"] })[0]?.id,
    ).toBe("high-backend");
  });

  it("round-trips filters through URL params", () => {
    const filters = {
      ...emptyFilters(),
      q: "checkout",
      severity: ["critical"] as const,
      effort: [1, 2] as const,
      category: ["ui"] as const,
      status: ["open"] as const,
      quadrant: ["quick_win"] as const,
    };
    const parsed = parseFilters(
      writeFilters(new URLSearchParams(), {
        ...filters,
        severity: [...filters.severity],
        effort: [...filters.effort],
        category: [...filters.category],
        status: [...filters.status],
        quadrant: [...filters.quadrant],
      }),
    );
    expect(parsed.q).toBe("checkout");
    expect(parsed.severity).toEqual(["critical"]);
    expect(parsed.effort).toEqual([1, 2]);
    expect(parsed.quadrant).toEqual(["quick_win"]);
  });

  it("ignores unknown filter values", () => {
    const parsed = parseFilters(
      new URLSearchParams("severity=critical,bogus&effort=9,2"),
    );
    expect(parsed.severity).toEqual(["critical"]);
    expect(parsed.effort).toEqual([2]);
  });
});

function emptyFilters() {
  return {
    q: "",
    severity: [] as Bug["severity"][],
    effort: [] as Bug["effort"][],
    category: [] as Bug["category"][],
    status: [] as Bug["status"][],
    quadrant: [] as Array<"quick_win" | "big_bet" | "fill_in" | "time_sink">,
  };
}

describe("summary", () => {
  it("counts pending, critical, quick wins, and weekly throughput", () => {
    const fixedRecently = bug({
      id: "fixed",
      status: "fixed",
      severity: "low",
      effort: 1,
      updatedAt: new Date(NOW - 2 * DAY).toISOString(),
    });
    const criticalQuickWin = bug({
      id: "quick",
      severity: "critical",
      effort: 1,
      createdAt: new Date(NOW - 2 * DAY).toISOString(),
    });
    const oldTimeSink = bug({
      id: "sink",
      severity: "low",
      effort: 4,
      createdAt: new Date(NOW - 40 * DAY).toISOString(),
    });

    const summary = summarize([fixedRecently, criticalQuickWin, oldTimeSink], NOW);

    expect(summary.total).toBe(3);
    expect(summary.pending).toBe(2);
    expect(summary.openCritical).toBe(1);
    expect(summary.quickWins).toBe(1);
    expect(summary.fixedThisWeek).toBe(1);
    expect(summary.newThisWeek).toBe(2);
    expect(summary.byQuadrant.time_sink).toBe(1);
    expect(summary.bySeverity.critical).toBe(1);
    expect(summary.lastUpdatedAt).toBe(criticalQuickWin.updatedAt);
  });
});

describe("filing trend", () => {
  it("buckets bugs into the last 14 days", () => {
    const trend = filingTrend(
      [
        bug({ id: "today", createdAt: new Date(NOW - 60 * 60 * 1000).toISOString() }),
        bug({ id: "two-days", createdAt: new Date(NOW - 2 * DAY).toISOString() }),
        bug({ id: "ancient", createdAt: new Date(NOW - 30 * DAY).toISOString() }),
      ],
      14,
      NOW,
    );

    expect(trend).toHaveLength(14);
    expect(trend.at(-1)?.count).toBe(1);
    expect(trend.at(-3)?.count).toBe(1);
    expect(trend.reduce((sum, day) => sum + day.count, 0)).toBe(2);
  });
});

describe("validation", () => {
  it("applies sensible defaults to a new bug", () => {
    const parsed = createBugSchema.parse({
      title: "Login fails on Safari",
      severity: "high",
      effort: 2,
    });
    expect(parsed.category).toBe("other");
    expect(parsed.status).toBe("open");
    expect(parsed.description).toBe("");
    expect(parsed.reportedBy).toBeUndefined();
  });

  it("rejects invalid effort and severity", () => {
    expect(
      createBugSchema.safeParse({
        title: "Broken thing",
        severity: "catastrophic",
        effort: 2,
      }).success,
    ).toBe(false);
    expect(
      createBugSchema.safeParse({
        title: "Broken thing",
        severity: "high",
        effort: 6,
      }).success,
    ).toBe(false);
  });

  it("requires a meaningful title", () => {
    expect(
      createBugSchema.safeParse({ title: "  x ", severity: "low", effort: 1 })
        .success,
    ).toBe(false);
  });
});
