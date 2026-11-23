import { cn } from "@/lib/format";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid h-6 w-6 shrink-0 grid-cols-2 grid-rows-2 gap-[3px]", className)}
    >
      <span className="rounded-[2px]" style={{ background: "var(--quad-quick)" }} />
      <span className="rounded-[2px]" style={{ background: "var(--quad-big)" }} />
      <span className="rounded-[2px]" style={{ background: "var(--quad-fill)" }} />
      <span className="rounded-[2px]" style={{ background: "var(--quad-sink)" }} />
    </span>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
        Bug Board
      </span>
      <span className="hidden rounded-[4px] border border-line px-1 py-px font-mono text-[8.5px] uppercase tracking-[0.14em] text-faint sm:inline">
        MCP
      </span>
    </span>
  );
}
