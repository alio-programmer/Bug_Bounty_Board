import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-line text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        className,
      )}
    >
      {icon ? <div className="text-faint">{icon}</div> : null}
      <div>
        <p className={cn("font-medium text-ink", compact ? "text-[13px]" : "text-sm")}>
          {title}
        </p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
