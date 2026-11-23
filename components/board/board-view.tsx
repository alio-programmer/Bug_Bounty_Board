"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterX, PlugZap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useBugBoard } from "@/components/bugboard-context";
import { FilterBar } from "@/components/filters/filter-bar";
import { PageHeader } from "@/components/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingSkeleton } from "@/components/ui/skeleton";
import {
  BUG_STATUSES,
  EFFORT_META,
  EFFORTS,
  QUADRANTS,
  QUADRANT_META,
  SEVERITIES,
  SEVERITY_META,
  STATUS_META,
  type BugStatus,
  type Effort,
  type Quadrant,
  type Severity,
} from "@/lib/domain/constants";
import { filterBugs } from "@/lib/domain/filters";
import { bugQuadrant, isPending, rankBugs } from "@/lib/domain/priority";
import type { Bug } from "@/lib/domain/types";
import { useBugFilters, useBugs } from "@/lib/hooks";
import { apiSeedDemo } from "@/lib/client-api";
import { cn } from "@/lib/format";
import { BugCard } from "./bug-card";

type GroupKey = "priority" | "effort" | "status" | "severity";

interface BoardColumn {
  key: string;
  label: string;
  description: string;
  color: string;
  bugs: Bug[];
}

const GROUP_OPTIONS: Array<{ key: GroupKey; label: string }> = [
  { key: "priority", label: "Priority" },
  { key: "effort", label: "Effort" },
  { key: "status", label: "Status" },
  { key: "severity", label: "Severity" },
];

const STATUS_HINTS: Record<BugStatus, string> = {
  open: "Not started yet",
  in_progress: "Actively being worked",
  fixed: "Resolved, awaiting verification",
  wontfix: "Closed intentionally",
};

function buildColumns(group: GroupKey, bugs: readonly Bug[]): BoardColumn[] {
  if (group === "effort") {
    return EFFORTS.map((effort: Effort) => ({
      key: String(effort),
      label: `E${effort} · ${EFFORT_META[effort].label}`,
      description: EFFORT_META[effort].hint,
      color: `var(--effort-${effort})`,
      bugs: rankBugs(bugs.filter((bug) => bug.effort === effort)),
    }));
  }

  if (group === "status") {
    return BUG_STATUSES.map((status: BugStatus) => ({
      key: status,
      label: STATUS_META[status].label,
      description: STATUS_HINTS[status],
      color: STATUS_META[status].color,
      bugs: rankBugs(bugs.filter((bug) => bug.status === status)),
    }));
  }

  if (group === "severity") {
    return SEVERITIES.map((severity: Severity) => ({
      key: severity,
      label: SEVERITY_META[severity].label,
      description: SEVERITY_META[severity].hint,
      color: SEVERITY_META[severity].color,
      bugs: rankBugs(bugs.filter((bug) => bug.severity === severity)),
    }));
  }

  return QUADRANTS.map((quadrant: Quadrant) => ({
    key: quadrant,
    label: QUADRANT_META[quadrant].label,
    description: `${QUADRANT_META[quadrant].action} · ${QUADRANT_META[quadrant].description}`,
    color: QUADRANT_META[quadrant].color,
    bugs: rankBugs(bugs.filter((bug) => bugQuadrant(bug) === quadrant)),
  }));
}

export function BoardView() {
  const { bugs, isLoading, error, refresh } = useBugs();
  const { filters, setFilters, reset } = useBugFilters();
  const { openBug, setNewBugOpen, setConnectOpen } = useBugBoard();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [seeding, setSeeding] = useState(false);

  const groupParam = searchParams.get("group");
  const group: GroupKey = GROUP_OPTIONS.some((option) => option.key === groupParam)
    ? (groupParam as GroupKey)
    : "priority";

  const filtered = useMemo(() => filterBugs(bugs, filters), [bugs, filters]);
  const columns = useMemo(() => buildColumns(group, filtered), [filtered, group]);
  const pendingCount = filtered.filter((bug) => isPending(bug.status)).length;

  const setGroup = (next: GroupKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "priority") params.delete("group");
    else params.set("group", next);
    const serialized = params.toString();
    router.replace(
      serialized ? `${pathname}?${serialized}` : pathname,
      { scroll: false },
    );
  };

  const loadDemo = async () => {
    setSeeding(true);
    try {
      const result = await apiSeedDemo();
      await refresh();
      toast.success(`Loaded ${result.inserted} demo bugs`);
    } catch (seedError) {
      toast.error(
        seedError instanceof Error ? seedError.message : "Could not load demo data",
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Work queue"
        title="Priority board"
        description="Grouped by what to do first. Change the lens without losing your filters."
        meta={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint sm:justify-end">
            <span>
              <span className="text-ink">{filtered.length}</span> in view
            </span>
            <span className="h-3 w-px bg-line" />
            <span>{pendingCount} pending</span>
          </div>
        }
      />

      {isLoading && bugs.length === 0 ? (
        <PageLoadingSkeleton />
      ) : error && bugs.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                Connection problem
              </p>
              <h2 className="mt-1 text-base font-semibold">
                Could not reach the board
              </h2>
              <p className="mt-1 text-[12px] text-muted">{error.message}</p>
            </div>
            <Button onClick={() => refresh()}>
              <RefreshCw size={13} strokeWidth={1.8} />
              Retry
            </Button>
          </div>
        </Card>
      ) : bugs.length === 0 ? (
        <Card className="p-8 sm:p-10">
          <div className="max-w-lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              Empty board
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em]">
              Nothing to triage yet.
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              File a bug by hand, load the demo board on the dashboard, or connect
              an AI client and let it populate the queue over MCP.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setNewBugOpen(true)}>
                File a bug
              </Button>
              <Button onClick={() => setConnectOpen(true)}>
                <PlugZap size={13} strokeWidth={1.8} />
                Connect AI
              </Button>
              <Button variant="ghost" onClick={loadDemo} disabled={seeding}>
                {seeding ? "Loading demo…" : "Load demo bugs"}
              </Button>
              <Link href="/" className={buttonStyles("ghost", "sm")}>
                Open dashboard
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <FilterBar
            bugs={bugs}
            filters={filters}
            onChange={setFilters}
            onReset={reset}
            resultCount={filtered.length}
            isLoading={isLoading}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                Group by
              </span>
              <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                {GROUP_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setGroup(option.key)}
                    aria-pressed={group === option.key}
                    className={cn(
                      "flex h-7 items-center rounded-md px-2.5 text-[11.5px] font-medium transition-colors",
                      group === option.key
                        ? "bg-raised text-ink"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
              Quick wins first · then severity & effort
            </p>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-6 sm:p-8">
              <EmptyState
                icon={<FilterX size={22} strokeWidth={1.5} />}
                title="No bugs match these filters"
                description="Clear the filters to bring the full board back."
                action={
                  <Button size="sm" onClick={reset} className="mt-1">
                    Clear filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <div
              className={cn(
                "grid auto-cols-[minmax(272px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-3 lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible",
                columns.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
              )}
            >
              {columns.map((column) => (
                <section key={column.key} className="min-w-0">
                  <div
                    className="mb-2.5 border-t-2 pt-2.5"
                    style={{ borderTopColor: column.color }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: column.color }}
                        />
                        <h2 className="truncate text-[12px] font-semibold text-ink">
                          {column.label}
                        </h2>
                      </div>
                      <span className="shrink-0 rounded-[5px] border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] tabular text-faint">
                        {column.bugs.length}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-faint">
                      {column.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {column.bugs.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-line px-3 py-7 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                        Nothing here
                      </div>
                    ) : (
                      column.bugs.map((bug) => (
                        <BugCard key={bug.id} bug={bug} onSelect={openBug} />
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
