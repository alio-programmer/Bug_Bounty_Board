import {
  Bug as BugIcon,
  CircleCheck,
  Flame,
  Zap,
} from "lucide-react";
import type { BoardSummary } from "@/lib/domain/stats";
import { Card } from "@/components/ui/card";

const TILES = [
  {
    key: "open",
    label: "Pending bugs",
    color: "var(--medium)",
    icon: BugIcon,
  },
  {
    key: "critical",
    label: "Critical open",
    color: "var(--critical)",
    icon: Flame,
  },
  {
    key: "quick",
    label: "Quick wins",
    color: "var(--quad-quick)",
    icon: Zap,
  },
  {
    key: "fixed",
    label: "Fixed · 7d",
    color: "var(--status-fixed)",
    icon: CircleCheck,
  },
] as const;

export function StatTiles({ summary }: { summary: BoardSummary }) {
  const values = {
    open: summary.pending,
    critical: summary.openCritical,
    quick: summary.quickWins,
    fixed: summary.fixedThisWeek,
  };

  const hints = {
    open: `${summary.newThisWeek} filed this week`,
    critical: `${summary.bySeverity.critical} critical overall`,
    quick: `${summary.byQuadrant.quick_win} total · high gain, low effort`,
    fixed: `${summary.byStatus.fixed} fixed all time`,
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <Card key={tile.key} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                {tile.label}
              </span>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
                style={{
                  color: tile.color,
                  borderColor: `color-mix(in srgb, ${tile.color} 26%, var(--line))`,
                  backgroundColor: `color-mix(in srgb, ${tile.color} 9%, transparent)`,
                }}
              >
                <Icon size={13} strokeWidth={1.8} />
              </span>
            </div>
            <p className="mt-3 font-mono text-[30px] leading-none tabular text-ink">
              {values[tile.key]}
            </p>
            <p className="mt-2.5 text-[10.5px] text-muted">{hints[tile.key]}</p>
          </Card>
        );
      })}
    </div>
  );
}
