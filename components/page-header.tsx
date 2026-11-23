import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  description,
  meta,
}: {
  kicker: string;
  title: string;
  description: string;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          {kicker}
        </p>
        <h1 className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.025em] text-ink sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
          {description}
        </p>
      </div>
      {meta ? <div className="pb-0.5">{meta}</div> : null}
    </div>
  );
}
