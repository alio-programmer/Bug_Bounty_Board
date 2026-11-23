"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Bug } from "@/lib/domain/types";
import { severityData } from "@/lib/domain/stats";
import { percent } from "@/lib/format";
import { Card, PanelHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/format";

export function SeverityDonut({
  bugs,
  className,
}: {
  bugs: readonly Bug[];
  className?: string;
}) {
  const data = severityData(bugs);
  const total = bugs.length;

  return (
    <Card className={cn("p-5", className)}>
      <PanelHeader
        kicker="Distribution"
        title="Severity mix"
        action={
          <span className="font-mono text-[9.5px] tabular uppercase tracking-[0.1em] text-faint">
            {total} total
          </span>
        }
      />

      {total === 0 ? (
        <EmptyState
          compact
          title="No bugs in view"
          description="Adjust the filters to see the severity split."
          className="mt-4"
        />
      ) : (
        <>
          <div className="relative mt-2 h-[158px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={73}
                  paddingAngle={2}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]?.payload as
                      | { label?: string; value?: number; color?: string }
                      | undefined;
                    if (!item) return null;
                    return (
                      <div className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11px] text-ink">
                        <span
                          className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: item.color }}
                        />
                        {item.label}:{" "}
                        <span className="font-mono tabular">
                          {item.value} ({percent(item.value ?? 0, total)})
                        </span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[26px] leading-none tabular text-ink">
                {total}
              </span>
              <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-faint">
                bugs
              </span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
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
