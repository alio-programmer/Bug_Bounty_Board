"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bug } from "@/lib/domain/types";
import { categoryData, type ChartDatum } from "@/lib/domain/stats";
import { percent } from "@/lib/format";
import { Card, PanelHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/format";

export function CategoryBars({
  bugs,
  className,
}: {
  bugs: readonly Bug[];
  className?: string;
}) {
  const data = categoryData(bugs);
  const total = bugs.length;
  const height = Math.max(170, data.length * 38 + 8);

  return (
    <Card className={cn("p-5", className)}>
      <PanelHeader
        kicker="Taxonomy"
        title="Bugs by category"
        description="Each area keeps the same pigment across every chart."
        action={
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
            {data.length} areas
          </span>
        }
      />

      {data.length === 0 ? (
        <EmptyState
          compact
          title="No categories to chart"
          description="Adjust the filters to see the area breakdown."
          className="mt-4"
        />
      ) : (
        <div className="mt-4" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, bottom: 0, left: 0 }}
              barCategoryGap={9}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={96}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10.5,
                  fill: "var(--muted)",
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--raised)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0]?.payload as ChartDatum | undefined;
                  if (!item) return null;
                  return (
                    <div className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11px] text-ink">
                      {item.label}:{" "}
                      <span className="font-mono tabular">
                        {item.value} ({percent(item.value, total)})
                      </span>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="value"
                barSize={13}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
                background={{ fill: "var(--raised)" }}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="var(--muted)"
                  fontSize={9.5}
                  fontFamily="var(--font-mono)"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
