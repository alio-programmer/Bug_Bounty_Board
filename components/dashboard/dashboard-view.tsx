"use client";

import { useMemo, useState } from "react";
import { FilterX, PlugZap, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useBugBoard } from "@/components/bugboard-context";
import { FilterBar } from "@/components/filters/filter-bar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingSkeleton } from "@/components/ui/skeleton";
import { CategoryBars } from "./category-bars";
import { FilingTrend } from "./filing-trend";
import { FixNext } from "./fix-next";
import { PriorityMatrix } from "./priority-matrix";
import { SeverityDonut } from "./severity-donut";
import { StatTiles } from "./stat-tiles";
import { StatusPipeline } from "./status-pipeline";
import { apiSeedDemo } from "@/lib/client-api";
import { filterBugs } from "@/lib/domain/filters";
import { summarize } from "@/lib/domain/stats";
import { useBugFilters, useBugs } from "@/lib/hooks";

const SYNC_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export function DashboardView() {
  const { bugs, serverTime, isLoading, error, refresh } = useBugs();
  const { filters, setFilters, reset } = useBugFilters();
  const { openBug, setNewBugOpen, setConnectOpen } = useBugBoard();
  const [seeding, setSeeding] = useState(false);

  const filtered = useMemo(() => filterBugs(bugs, filters), [bugs, filters]);
  const summary = useMemo(() => summarize(filtered), [filtered]);

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

  const syncTime = serverTime
    ? new Date(serverTime).toLocaleTimeString(undefined, SYNC_FORMAT)
    : "—";

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Triage desk"
        title="Overview"
        description="Spend effort where the gain is highest. Every chart and the board share one filter."
        meta={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint sm:justify-end">
            <span>
              <span className="text-ink">{bugs.length}</span> bugs
            </span>
            <span className="h-3 w-px bg-line" />
            <span>Synced {syncTime}</span>
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
              <p className="mt-1 text-[12px] text-muted">
                {error.message}. The app reads a local SQLite file.
              </p>
            </div>
            <Button onClick={() => refresh()}>
              <RefreshCw size={13} strokeWidth={1.8} />
              Retry
            </Button>
          </div>
        </Card>
      ) : bugs.length === 0 ? (
        <Card className="p-6 sm:p-10">
          <div className="max-w-xl">
            <div className="grid h-16 w-16 grid-cols-2 grid-rows-2 gap-1 rounded-lg border border-line p-1.5">
              <span
                className="rounded-[2px]"
                style={{ background: "color-mix(in srgb, var(--quad-quick) 25%, transparent)" }}
              />
              <span
                className="rounded-[2px]"
                style={{ background: "color-mix(in srgb, var(--quad-big) 25%, transparent)" }}
              />
              <span
                className="rounded-[2px]"
                style={{ background: "color-mix(in srgb, var(--quad-fill) 25%, transparent)" }}
              />
              <span
                className="rounded-[2px]"
                style={{ background: "color-mix(in srgb, var(--quad-sink) 25%, transparent)" }}
              />
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              Empty board
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em]">
              A quiet board is a rare thing.
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Load a demo board to explore the charts, file a bug by hand, or
              connect an AI client and let it triage a batch through MCP.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                onClick={loadDemo}
                disabled={seeding}
              >
                <Sparkles size={13} strokeWidth={1.8} />
                {seeding ? "Loading demo…" : "Load demo bugs"}
              </Button>
              <Button onClick={() => setNewBugOpen(true)}>File a bug</Button>
              <Button variant="ghost" onClick={() => setConnectOpen(true)}>
                <PlugZap size={13} strokeWidth={1.8} />
                Connect AI
              </Button>
            </div>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
              Demo data is optional · npm run db:seed
            </p>
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

          {filtered.length === 0 ? (
            <Card className="p-6 sm:p-8">
              <EmptyState
                icon={<FilterX size={22} strokeWidth={1.5} />}
                title="No bugs match these filters"
                description="The board has bugs, just not under this combination. Clear the filters to see everything."
                action={
                  <Button size="sm" onClick={reset} className="mt-1">
                    Clear filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <StatTiles summary={summary} />

              <div className="grid gap-4 xl:grid-cols-12">
                <PriorityMatrix
                  bugs={filtered}
                  onSelect={openBug}
                  className="xl:col-span-8"
                />
                <div className="flex flex-col gap-4 xl:col-span-4">
                  <SeverityDonut bugs={filtered} />
                  <StatusPipeline
                    bugs={filtered}
                    fixedThisWeek={summary.fixedThisWeek}
                  />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-12">
                <CategoryBars bugs={filtered} className="xl:col-span-7" />
                <FixNext bugs={filtered} onSelect={openBug} className="xl:col-span-5" />
              </div>

              <FilingTrend bugs={filtered} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
