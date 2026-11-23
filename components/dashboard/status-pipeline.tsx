"use client";

import type { Bug } from "@/lib/domain/types";
import { statusData } from "@/lib/domain/stats";
import { percent } from "@/lib/format";
import { Card, PanelHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/format";

export function StatusPipeline({
  bugs,
  fixedThisWeek = 0,
  className,
}: {
  bugs: readonly Bug[];
  fixedThisWeek?: number;
  className?: string;
}) {
  const data = statusData(bugs);
  const total = bugs.length;

  return (
    <Card className={cn("p-5", className)}>
      <PanelHeader
        kicker="Flow"
        title="Status pipeline"
        action={
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
            {fixedThisWeek} fixed / 7d
          </span>
        }
      />

      {total === 0 ? (
        <EmptyState
          compact
          title="Nothing in the pipeline"
          description="Adjust the filters to see status flow."
          className="mt-4"
        />
      ) : (
        <>
          <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-raised">
            {data.map((entry) => (
              <span
                key={entry.key}
                title={`${entry.label}: ${entry.value}`}
                style={{
                  width: `${(entry.value / total) * 100}%`,
                  background: entry.color,
                }}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {data.map((entry) => (
              <div key={entry.key} className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: entry.color }}
                />
                <span className="min-w-0 flex-1 truncate text-[11px] text-muted">
                  {entry.label}
                </span>
                <span className="font-mono text-[10px] tabular text-ink">
                  {entry.value}
                </span>
                <span className="w-8 text-right font-mono text-[9px] tabular text-faint">
                  {percent(entry.value, total)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
