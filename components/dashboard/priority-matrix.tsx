"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CATEGORY_META,
  EFFORT_META,
  QUADRANT_META,
  QUADRANTS,
  SEVERITY_META,
  type Quadrant,
  type Severity,
} from "@/lib/domain/constants";
import { bugQuadrant } from "@/lib/domain/priority";
import { quadrantData } from "@/lib/domain/stats";
import type { Bug } from "@/lib/domain/types";
import { Card, PanelHeader } from "@/components/ui/card";
import { SeverityBadge } from "@/components/bug-badges";
import { cn } from "@/lib/format";

interface MatrixPoint {
  x: number;
  y: number;
  bug: Bug;
  quadrant: Quadrant;
  color: string;
}

const WEIGHT_TO_SEVERITY: Record<number, Severity> = {
  1: "low",
  2: "medium",
  3: "high",
  4: "critical",
};

function buildPoints(bugs: readonly Bug[]): MatrixPoint[] {
  const groups = new Map<string, Bug[]>();
  for (const bug of bugs) {
    const key = `${bug.effort}-${SEVERITY_META[bug.severity].weight}`;
    const list = groups.get(key);
    if (list) list.push(bug);
    else groups.set(key, [bug]);
  }

  const points: MatrixPoint[] = [];
  for (const group of groups.values()) {
    const count = group.length;
    group.forEach((bug, index) => {
      const weight = SEVERITY_META[bug.severity].weight;
      const spread =
        count === 1 ? 0 : 0.18 + Math.min(0.12, Math.floor(index / 7) * 0.04);
      const angle = (index / count) * Math.PI * 2 + (weight % 2) * 0.5;
      const quadrant = bugQuadrant(bug);
      points.push({
        x: bug.effort + Math.cos(angle) * spread,
        y: weight + Math.sin(angle) * spread * 0.82,
        bug,
        quadrant,
        color: QUADRANT_META[quadrant].color,
      });
    });
  }
  return points;
}

function MatrixTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as MatrixPoint | undefined;
  if (!point) return null;
  const { bug } = point;

  return (
    <div className="max-w-[260px] rounded-lg border border-line bg-surface p-3">
      <div className="flex items-center gap-2">
        <SeverityBadge severity={bug.severity} />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
          E{bug.effort} · {EFFORT_META[bug.effort].label}
        </span>
      </div>
      <p className="mt-2 text-[12px] font-medium leading-snug text-ink">
        {bug.title}
      </p>
      <p className="mt-1.5 text-[10px] text-faint">
        {CATEGORY_META[bug.category].label} · {QUADRANT_META[point.quadrant].label}
      </p>
    </div>
  );
}

export function PriorityMatrix({
  bugs,
  onSelect,
  className,
}: {
  bugs: readonly Bug[];
  onSelect: (id: string) => void;
  className?: string;
}) {
  const points = useMemo(() => buildPoints(bugs), [bugs]);
  const counts = useMemo(() => quadrantData(bugs), [bugs]);
  const countByQuadrant = useMemo(
    () =>
      Object.fromEntries(counts.map((item) => [item.key, item.value])) as Record<
        Quadrant,
        number
      >,
    [counts],
  );

  return (
    <Card className={cn("p-5", className)}>
      <PanelHeader
        kicker="Priority matrix"
        title="Effort × severity"
        description="Position is effort (x) and gain (y). Click a bubble to open it."
        action={
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
            {bugs.length} bugs
          </span>
        }
      />

      <div className="relative mt-3 h-[318px] w-full">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            paddingTop: 8,
            paddingRight: 8,
            paddingBottom: 28,
            paddingLeft: 52,
          }}
        >
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {QUADRANTS.map((quadrant, index) => {
              const meta = QUADRANT_META[quadrant];
              const top = index < 2;
              const right = index % 2 === 1;
              return (
                <div
                  key={quadrant}
                  className={cn(
                    "flex p-2",
                    top ? "items-start" : "items-end",
                    right ? "justify-end text-right" : "justify-start",
                  )}
                  style={{
                    background: `color-mix(in srgb, ${meta.color} 3.5%, transparent)`,
                  }}
                >
                  <span
                    className="inline-flex flex-col gap-0.5"
                    style={{ color: meta.color }}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
                      {meta.label}
                      <span className="ml-1.5 text-faint">
                        {countByQuadrant[quadrant]}
                      </span>
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid
              stroke="var(--line)"
              strokeDasharray="3 4"
              vertical={false}
              strokeOpacity={0.65}
            />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value: number) => `E${value}`}
              tick={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fill: "var(--faint)",
              }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              height={28}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0.25, 4.75]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(value: number) =>
                WEIGHT_TO_SEVERITY[value]
                  ? SEVERITY_META[WEIGHT_TO_SEVERITY[value]].label
                  : ""
              }
              width={52}
              tick={{
                fontFamily: "var(--font-mono)",
                fontSize: 8.5,
                fill: "var(--faint)",
              }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              x={2.5}
              stroke="var(--line-strong)"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={2.5}
              stroke="var(--line-strong)"
              strokeDasharray="3 3"
            />
            <Tooltip
              cursor={{ stroke: "var(--line-strong)", strokeDasharray: "3 3" }}
              content={<MatrixTooltip />}
            />
            <Scatter
              data={points}
              dataKey="y"
              isAnimationActive={false}
              shape={(props: unknown) => {
                const { cx, cy, payload } = props as {
                  cx?: number;
                  cy?: number;
                  payload?: MatrixPoint;
                };
                if (cx == null || cy == null || !payload) return <g />;
                return (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${payload.bug.title}, ${SEVERITY_META[payload.bug.severity].label} severity, effort ${payload.bug.effort}`}
                    onClick={() => onSelect(payload.bug.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(payload.bug.id);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={cx} cy={cy} r={12} fill="transparent" />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={payload.color}
                      fillOpacity={0.92}
                      stroke="var(--surface)"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3">
        {QUADRANTS.map((quadrant) => {
          const meta = QUADRANT_META[quadrant];
          return (
            <span
              key={quadrant}
              className="inline-flex items-center gap-1.5 text-[10px] text-muted"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
              <span className="font-mono text-[9px] tabular text-faint">
                {countByQuadrant[quadrant]}
              </span>
            </span>
          );
        })}
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
          effort 1 → 5
        </span>
      </div>
    </Card>
  );
}
