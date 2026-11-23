"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bug } from "@/lib/domain/types";
import { filingTrend } from "@/lib/domain/stats";
import { Card, PanelHeader } from "@/components/ui/card";
import { cn } from "@/lib/format";

export function FilingTrend({
  bugs,
  className,
}: {
  bugs: readonly Bug[];
  className?: string;
}) {
  const trend = filingTrend(bugs, 14);
  const total = trend.reduce((sum, day) => sum + day.count, 0);

  return (
    <Card className={cn("p-5", className)}>
      <PanelHeader
        kicker="Intake"
        title="Bugs filed"
        description="File volume over the last 14 days."
        action={
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
            {total} in 14d
          </span>
        }
      />
      <div className="mt-4 h-[138px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trend}
            margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="28%"
          >
            <XAxis
              dataKey="label"
              tick={{
                fontFamily: "var(--font-mono)",
                fontSize: 8.5,
                fill: "var(--faint)",
              }}
              axisLine={false}
              tickLine={false}
              interval={1}
              tickMargin={7}
            />
            <YAxis hide domain={[0, "auto"]} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "var(--raised)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as
                  | { fullLabel?: string; count?: number }
                  | undefined;
                if (!item) return null;
                return (
                  <div className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11px] text-ink">
                    {item.fullLabel}:{" "}
                    <span className="font-mono tabular">{item.count}</span>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--medium)"
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
