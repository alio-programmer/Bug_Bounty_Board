"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ListChecks } from "lucide-react";
import { CATEGORY_META } from "@/lib/domain/constants";
import {
  formatPriorityScore,
  isPending,
  rankBugs,
} from "@/lib/domain/priority";
import type { Bug } from "@/lib/domain/types";
import { SEVERITY_META } from "@/lib/domain/constants";
import { Card, PanelHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EffortPips } from "@/components/bug-badges";
import { cn } from "@/lib/format";

export function FixNext({
  bugs,
  onSelect,
  className,
}: {
  bugs: readonly Bug[];
  onSelect: (id: string) => void;
  className?: string;
}) {
  const ranked = rankBugs(bugs.filter((bug) => isPending(bug.status))).slice(0, 6);
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const boardHref = query ? `/board?${query}` : "/board";

  return (
    <Card className={cn("p-5", className)}>
      <PanelHeader
        kicker="Queue"
        title="Fix these next"
        description="Pending bugs ranked by gain ÷ effort."
        action={
          <Link
            href={boardHref}
            className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-ink"
          >
            Board
            <ArrowRight size={11} strokeWidth={1.8} />
          </Link>
        }
      />

      {ranked.length === 0 ? (
        <EmptyState
          compact
          icon={<ListChecks size={18} strokeWidth={1.6} />}
          title="No pending bugs in view"
          description="Everything matching these filters is resolved or hidden."
          className="mt-4"
        />
      ) : (
        <div className="mt-3">
          {ranked.map((bug, index) => {
            const severity = SEVERITY_META[bug.severity];
            return (
              <button
                key={bug.id}
                type="button"
                onClick={() => onSelect(bug.id)}
                className={cn(
                  "group flex w-full items-start gap-2.5 border-t border-line py-2.5 text-left first:border-t-0 first:pt-0.5",
                )}
              >
                <span className="mt-[3px] w-4 shrink-0 font-mono text-[9px] tabular text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover:text-ink">
                    {bug.title}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className="font-mono text-[9px] font-medium uppercase tracking-[0.07em]"
                      style={{ color: severity.color }}
                    >
                      {severity.label}
                    </span>
                    <span className="text-[10px] text-faint">
                      {CATEGORY_META[bug.category].label}
                    </span>
                    <EffortPips effort={bug.effort} showLabel={false} />
                  </span>
                </span>
                <span className="shrink-0 pl-1 text-right">
                  <span className="block font-mono text-[11px] tabular text-ink">
                    {formatPriorityScore(bug.severity, bug.effort)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[7.5px] uppercase tracking-[0.1em] text-faint">
                    g/e
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
