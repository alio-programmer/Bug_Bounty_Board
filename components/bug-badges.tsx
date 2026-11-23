import {
  CATEGORY_META,
  EFFORT_META,
  QUADRANT_META,
  SEVERITY_META,
  STATUS_META,
  type BugStatus,
  type Category,
  type Effort,
  type Quadrant,
  type Severity,
} from "@/lib/domain/constants";
import { cn } from "@/lib/format";

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[5px] border px-1.5 py-0.5 font-mono text-[9.5px] font-medium uppercase leading-4 tracking-[0.07em]",
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 27%, var(--line))`,
        backgroundColor: `color-mix(in srgb, ${meta.color} 9%, transparent)`,
      }}
      title={meta.hint}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function CategoryChip({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted",
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function StatusText({
  status,
  className,
}: {
  status: BugStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted",
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function EffortPips({
  effort,
  showLabel = true,
  className,
}: {
  effort: Effort;
  showLabel?: boolean;
  className?: string;
}) {
  const meta = EFFORT_META[effort];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`Effort ${effort} — ${meta.label} (${meta.hint})`}
    >
      <span
        className="flex items-end gap-[2px]"
        role="img"
        aria-label={`Effort ${effort} of 5, ${meta.label}`}
      >
        {[1, 2, 3, 4, 5].map((pip) => (
          <span
            key={pip}
            className="w-[3px] rounded-[1px]"
            style={{
              height: `${4 + pip * 1.5}px`,
              background:
                pip <= effort ? "var(--ink)" : "var(--line-strong)",
              opacity: pip <= effort ? 0.78 : 0.65,
            }}
          />
        ))}
      </span>
      {showLabel ? (
        <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">
          {meta.short}
        </span>
      ) : null}
    </span>
  );
}

export function SourceBadge({
  reportedBy,
  className,
}: {
  reportedBy: string;
  className?: string;
}) {
  const human = reportedBy.toLowerCase() === "human";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint",
        className,
      )}
      title={human ? "Filed by a human" : `Filed via ${reportedBy}`}
    >
      {human ? "Human" : `via ${reportedBy}`}
    </span>
  );
}

export function QuadrantChip({
  quadrant,
  showDot = true,
  className,
}: {
  quadrant: Quadrant;
  showDot?: boolean;
  className?: string;
}) {
  const meta = QUADRANT_META[quadrant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium text-ink",
        className,
      )}
    >
      {showDot ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: meta.color }}
        />
      ) : null}
      {meta.label}
    </span>
  );
}
