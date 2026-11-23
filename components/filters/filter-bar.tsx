"use client";

import { useEffect, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, Search, X } from "lucide-react";
import {
  BUG_STATUSES,
  CATEGORIES,
  CATEGORY_META,
  EFFORT_META,
  EFFORTS,
  QUADRANTS,
  QUADRANT_META,
  SEVERITIES,
  SEVERITY_META,
  STATUS_META,
  type BugStatus,
  type Category,
  type Effort,
  type Quadrant,
  type Severity,
} from "@/lib/domain/constants";
import {
  activeFilterCount,
  hasActiveFilters,
  type BugFilters,
} from "@/lib/domain/filters";
import { bugQuadrant } from "@/lib/domain/priority";
import type { Bug } from "@/lib/domain/types";
import { useDebouncedValue } from "@/lib/hooks";
import { cn } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface FilterOption {
  value: string;
  label: string;
  count: number;
  color?: string;
}

function toggleValue<T extends string | number>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function FilterMenu({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: FilterOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "border border-transparent text-muted",
            selected.length > 0 &&
              "border-line bg-raised text-ink hover:bg-raised",
          )}
        >
          {label}
          {selected.length > 0 ? (
            <span className="rounded-[4px] bg-ink/10 px-1 font-mono text-[9.5px] text-ink">
              {selected.length}
            </span>
          ) : null}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[45] w-56 rounded-lg border border-line bg-surface p-1.5"
        >
          <div className="flex items-center justify-between gap-3 px-1.5 pb-1.5 pt-0.5">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
              {label}
            </span>
            {selected.length > 0 ? (
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] font-medium text-faint transition-colors hover:text-ink"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="space-y-0.5">
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggle(option.value)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
                >
                  <span
                    className={cn(
                      "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
                      checked
                        ? "border-ink bg-ink text-canvas"
                        : "border-line-strong bg-transparent",
                    )}
                  >
                    {checked ? <Check size={10} strokeWidth={2.6} /> : null}
                  </span>
                  {option.color ? (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: option.color }}
                    />
                  ) : null}
                  <span className="flex-1 truncate">{option.label}</span>
                  <span className="font-mono text-[9.5px] tabular text-faint">
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function FilterBar({
  bugs,
  filters,
  onChange,
  onReset,
  resultCount,
  isLoading = false,
}: {
  bugs: readonly Bug[];
  filters: BugFilters;
  onChange: (filters: BugFilters) => void;
  onReset: () => void;
  resultCount: number;
  isLoading?: boolean;
}) {
  const [search, setSearch] = useState(filters.q);
  const [lastRemoteQuery, setLastRemoteQuery] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(search, 250);

  if (filters.q !== lastRemoteQuery) {
    setLastRemoteQuery(filters.q);
    setSearch(filters.q);
  }

  useEffect(() => {
    if (debouncedSearch === filters.q) return;
    onChange({ ...filters, q: debouncedSearch });
  }, [debouncedSearch, filters, onChange]);

  const counts = useMemo(() => {
    const severity = Object.fromEntries(SEVERITIES.map((key) => [key, 0])) as Record<
      Severity,
      number
    >;
    const effort = Object.fromEntries(EFFORTS.map((key) => [key, 0])) as Record<
      Effort,
      number
    >;
    const category = Object.fromEntries(
      CATEGORIES.map((key) => [key, 0]),
    ) as Record<Category, number>;
    const status = Object.fromEntries(BUG_STATUSES.map((key) => [key, 0])) as Record<
      BugStatus,
      number
    >;
    const quadrant = Object.fromEntries(
      QUADRANTS.map((key) => [key, 0]),
    ) as Record<Quadrant, number>;

    for (const bug of bugs) {
      severity[bug.severity] += 1;
      effort[bug.effort] += 1;
      category[bug.category] += 1;
      status[bug.status] += 1;
      quadrant[bugQuadrant(bug)] += 1;
    }
    return { severity, effort, category, status, quadrant };
  }, [bugs]);

  const severityOptions: FilterOption[] = SEVERITIES.map((severity) => ({
    value: severity,
    label: SEVERITY_META[severity].label,
    count: counts.severity[severity],
    color: SEVERITY_META[severity].color,
  }));

  const effortOptions: FilterOption[] = EFFORTS.map((effort) => ({
    value: String(effort),
    label: `${effort} · ${EFFORT_META[effort].label}`,
    count: counts.effort[effort],
  }));

  const categoryOptions: FilterOption[] = CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_META[category].label,
    count: counts.category[category],
    color: CATEGORY_META[category].color,
  }));

  const statusOptions: FilterOption[] = BUG_STATUSES.map((status) => ({
    value: status,
    label: STATUS_META[status].label,
    count: counts.status[status],
    color: STATUS_META[status].color,
  }));

  const quadrantOptions: FilterOption[] = QUADRANTS.map((quadrant) => ({
    value: quadrant,
    label: QUADRANT_META[quadrant].label,
    count: counts.quadrant[quadrant],
    color: QUADRANT_META[quadrant].color,
  }));

  const active = hasActiveFilters(filters);

  return (
    <div className="rounded-xl border border-line bg-surface p-2 sm:p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative min-w-[190px] flex-1">
          <Search
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bugs, descriptions, ids…"
            aria-label="Search bugs"
            className="h-9 w-full rounded-lg border border-line bg-canvas pl-9 pr-8 text-[13px] text-ink placeholder:text-faint transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                if (filters.q) onChange({ ...filters, q: "" });
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-faint hover:bg-raised hover:text-ink"
            >
              <X size={12} strokeWidth={2} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-0.5">
          <FilterMenu
            label="Severity"
            options={severityOptions}
            selected={filters.severity}
            onToggle={(value) =>
              onChange({
                ...filters,
                severity: toggleValue(filters.severity, value as Severity),
              })
            }
            onClear={() => onChange({ ...filters, severity: [] })}
          />
          <FilterMenu
            label="Effort"
            options={effortOptions}
            selected={filters.effort.map(String)}
            onToggle={(value) =>
              onChange({
                ...filters,
                effort: toggleValue(filters.effort, Number(value) as Effort),
              })
            }
            onClear={() => onChange({ ...filters, effort: [] })}
          />
          <FilterMenu
            label="Category"
            options={categoryOptions}
            selected={filters.category}
            onToggle={(value) =>
              onChange({
                ...filters,
                category: toggleValue(filters.category, value as Category),
              })
            }
            onClear={() => onChange({ ...filters, category: [] })}
          />
          <FilterMenu
            label="Status"
            options={statusOptions}
            selected={filters.status}
            onToggle={(value) =>
              onChange({
                ...filters,
                status: toggleValue(filters.status, value as BugStatus),
              })
            }
            onClear={() => onChange({ ...filters, status: [] })}
          />
          <FilterMenu
            label="Priority"
            options={quadrantOptions}
            selected={filters.quadrant}
            onToggle={(value) =>
              onChange({
                ...filters,
                quadrant: toggleValue(filters.quadrant, value as Quadrant),
              })
            }
            onClear={() => onChange({ ...filters, quadrant: [] })}
          />
        </div>

        <div className="ml-auto flex items-center gap-2 pl-1">
          {active ? (
            <>
              <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint md:inline">
                {activeFilterCount(filters)} active
              </span>
              <Button variant="ghost" size="sm" onClick={onReset}>
                <X size={12} strokeWidth={2} />
                Clear
              </Button>
            </>
          ) : null}
          <span className="hidden font-mono text-[10px] tabular text-faint sm:inline">
            {isLoading ? "Loading…" : `${resultCount} shown`}
          </span>
        </div>
      </div>
    </div>
  );
}
