"use client";

import {
  BUG_STATUSES,
  CATEGORIES,
  CATEGORY_META,
  EFFORT_META,
  EFFORTS,
  QUADRANT_META,
  SEVERITIES,
  SEVERITY_META,
  STATUS_META,
  type BugStatus,
  type Category,
  type Effort,
  type Severity,
} from "@/lib/domain/constants";
import { getQuadrant } from "@/lib/domain/priority";
import { formatPriorityScore } from "@/lib/domain/priority";
import type { Bug } from "@/lib/domain/types";
import type { CreateBugInput, UpdateBugInput } from "@/lib/validation";
import { cn } from "@/lib/format";
import { FieldLabel, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface BugDraft {
  title: string;
  description: string;
  severity: Severity;
  effort: Effort;
  category: Category;
  status: BugStatus;
}

export function emptyDraft(): BugDraft {
  return {
    title: "",
    description: "",
    severity: "medium",
    effort: 3,
    category: "other",
    status: "open",
  };
}

export function draftFromBug(bug: Bug): BugDraft {
  return {
    title: bug.title,
    description: bug.description,
    severity: bug.severity,
    effort: bug.effort,
    category: bug.category,
    status: bug.status,
  };
}

export function validateDraft(draft: BugDraft): string | null {
  if (draft.title.trim().length < 3) {
    return "Give the bug a clear title (at least 3 characters).";
  }
  if (draft.title.trim().length > 160) {
    return "Keep the title under 160 characters.";
  }
  if (draft.description.length > 10_000) {
    return "Keep the description under 10,000 characters.";
  }
  return null;
}

export function draftToCreateInput(draft: BugDraft): CreateBugInput {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    severity: draft.severity,
    effort: draft.effort,
    category: draft.category,
    status: draft.status,
    reportedBy: "human",
  };
}

export function draftToUpdateInput(draft: BugDraft): UpdateBugInput {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    severity: draft.severity,
    effort: draft.effort,
    category: draft.category,
    status: draft.status,
  };
}

export function draftMatchesBug(draft: BugDraft, bug: Bug): boolean {
  return (
    draft.title.trim() === bug.title &&
    draft.description.trim() === bug.description &&
    draft.severity === bug.severity &&
    draft.effort === bug.effort &&
    draft.category === bug.category &&
    draft.status === bug.status
  );
}

export function TitleInput({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <>
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint"
      >
        Title
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={160}
        placeholder="What is broken, and where?"
        autoFocus
        className={cn(
          "mt-1.5 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink placeholder:text-faint transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/25",
          className,
        )}
      />
    </>
  );
}

function SeverityPicker({
  value,
  onChange,
}: {
  value: Severity;
  onChange: (severity: Severity) => void;
}) {
  return (
    <div>
      <FieldLabel hint="Impact / gain">Severity</FieldLabel>
      <div
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
        role="group"
        aria-label="Severity"
      >
        {SEVERITIES.map((severity) => {
          const meta = SEVERITY_META[severity];
          const selected = value === severity;
          return (
            <button
              key={severity}
              type="button"
              aria-pressed={selected}
              title={meta.hint}
              onClick={() => onChange(severity)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg border px-2 text-[12px] font-medium transition-colors",
                selected
                  ? "bg-raised"
                  : "border-line bg-canvas text-muted hover:border-line-strong hover:text-ink",
              )}
              style={
                selected
                  ? {
                      color: meta.color,
                      borderColor: `color-mix(in srgb, ${meta.color} 45%, var(--line))`,
                      backgroundColor: `color-mix(in srgb, ${meta.color} 11%, transparent)`,
                    }
                  : undefined
              }
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EffortPicker({
  value,
  onChange,
}: {
  value: Effort;
  onChange: (effort: Effort) => void;
}) {
  return (
    <div>
      <FieldLabel hint="Engineering estimate">Effort</FieldLabel>
      <div
        className="grid grid-cols-5 gap-1.5"
        role="group"
        aria-label="Effort"
      >
        {EFFORTS.map((effort) => {
          const meta = EFFORT_META[effort];
          const selected = value === effort;
          return (
            <button
              key={effort}
              type="button"
              aria-pressed={selected}
              title={`${meta.label} — ${meta.hint}`}
              onClick={() => onChange(effort)}
              className={cn(
                "flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border transition-colors",
                selected
                  ? "border-line-strong bg-raised text-ink"
                  : "border-line bg-canvas text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              <span className="font-mono text-[15px] font-medium tabular">
                {effort}
              </span>
              <span className="text-[9.5px]">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuadrantPreview({
  severity,
  effort,
}: {
  severity: Severity;
  effort: Effort;
}) {
  const quadrant = getQuadrant(severity, effort);
  const meta = QUADRANT_META[quadrant];
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: meta.color }}
        />
        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium text-ink">{meta.label}</p>
          <p className="truncate text-[10.5px] text-faint">
            {meta.description} · {meta.action}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[13px] tabular text-ink">
          {formatPriorityScore(severity, effort)}
        </p>
        <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-faint">
          gain / effort
        </p>
      </div>
    </div>
  );
}

export function ClassificationFields({
  draft,
  onChange,
  idPrefix,
  showDescription = true,
}: {
  draft: BugDraft;
  onChange: (patch: Partial<BugDraft>) => void;
  idPrefix: string;
  showDescription?: boolean;
}) {
  return (
    <div className="space-y-5">
      {showDescription ? (
        <div>
          <FieldLabel
            htmlFor={`${idPrefix}-description`}
            hint="Repro steps, expected vs actual"
          >
            Description
          </FieldLabel>
          <Textarea
            id={`${idPrefix}-description`}
            value={draft.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Steps to reproduce, what happened, and what you expected…"
            rows={5}
          />
        </div>
      ) : null}

      <SeverityPicker
        value={draft.severity}
        onChange={(severity) => onChange({ severity })}
      />

      <EffortPicker
        value={draft.effort}
        onChange={(effort) => onChange({ effort })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={`${idPrefix}-category`}>Category</FieldLabel>
          <Select
            id={`${idPrefix}-category`}
            value={draft.category}
            onValueChange={(value) => onChange({ category: value as Category })}
            options={CATEGORIES.map((category) => ({
              value: category,
              label: CATEGORY_META[category].label,
              color: CATEGORY_META[category].color,
            }))}
          />
        </div>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-status`}>Status</FieldLabel>
          <Select
            id={`${idPrefix}-status`}
            value={draft.status}
            onValueChange={(value) => onChange({ status: value as BugStatus })}
            options={BUG_STATUSES.map((status) => ({
              value: status,
              label: STATUS_META[status].label,
              color: STATUS_META[status].color,
            }))}
          />
        </div>
      </div>

      <QuadrantPreview severity={draft.severity} effort={draft.effort} />
    </div>
  );
}
