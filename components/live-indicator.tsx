"use client";

import { useBugs } from "@/lib/hooks";
import { cn } from "@/lib/format";

export function LiveIndicator() {
  const { isLoading, error, isValidating } = useBugs();

  const offline = Boolean(error);
  const label = offline ? "Offline" : isLoading ? "Connecting" : "Live";

  return (
    <span
      className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint lg:inline-flex"
      title={offline ? "Cannot reach the board" : "AI-filed bugs appear within 5 seconds"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-opacity",
          offline ? "bg-faint" : "bg-low",
          isValidating && !offline && "opacity-45",
        )}
      />
      {label}
    </span>
  );
}
