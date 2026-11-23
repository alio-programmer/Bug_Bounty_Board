"use client";

import { Sparkles } from "lucide-react";
import type { Bug } from "@/lib/domain/types";
import { relativeTime } from "@/lib/format";
import {
  CategoryChip,
  EffortPips,
  SeverityBadge,
  StatusText,
} from "@/components/bug-badges";
import { cn } from "@/lib/format";

export function BugCard({
  bug,
  onSelect,
  className,
}: {
  bug: Bug;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const aiReported = bug.reportedBy.toLowerCase() !== "human";

  return (
    <button
      type="button"
      onClick={() => onSelect(bug.id)}
      className={cn(
        "group w-full rounded-lg border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong hover:bg-raised/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <CategoryChip category={bug.category} className="min-w-0 truncate" />
        <span className="flex shrink-0 items-center gap-1.5">
          {aiReported ? (
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="text-faint"
              aria-label={`Filed via ${bug.reportedBy}`}
            />
          ) : null}
          <SeverityBadge severity={bug.severity} />
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-[12.5px] font-medium leading-snug text-ink">
        {bug.title}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <EffortPips effort={bug.effort} />
          <span className="h-2.5 w-px shrink-0 bg-line" />
          <StatusText status={bug.status} className="truncate" />
        </span>
        <span className="shrink-0 font-mono text-[9px] tabular text-faint">
          {relativeTime(bug.createdAt)}
        </span>
      </div>
    </button>
  );
}
