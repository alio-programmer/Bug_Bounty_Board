"use client";

import { useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useBugBoard } from "@/components/bugboard-context";
import {
  CategoryChip,
  SeverityBadge,
  SourceBadge,
} from "@/components/bug-badges";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiDeleteBug, apiUpdateBug } from "@/lib/client-api";
import { useBugs } from "@/lib/hooks";
import { formatDateTime, relativeTime } from "@/lib/format";
import {
  ClassificationFields,
  draftFromBug,
  draftMatchesBug,
  draftToUpdateInput,
  validateDraft,
  type BugDraft,
} from "./bug-form";

export function BugDrawer() {
  const { selectedBugId, closeBug } = useBugBoard();
  const { bugs, isLoading } = useBugs();
  const bug = selectedBugId
    ? bugs.find((candidate) => candidate.id === selectedBugId)
    : undefined;

  const [draft, setDraft] = useState<BugDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedId = useRef<string | null>(null);

  useEffect(() => {
    if (bug && loadedId.current !== bug.id) {
      loadedId.current = bug.id;
      setDraft(draftFromBug(bug));
      setConfirmDelete(false);
      setError(null);
    }
  }, [bug]);

  useEffect(() => {
    if (selectedBugId && !isLoading && !bug) {
      closeBug();
    }
  }, [bug, closeBug, isLoading, selectedBugId]);

  const reset = () => {
    loadedId.current = null;
    setDraft(null);
    setConfirmDelete(false);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      closeBug();
    }
  };

  const patch = (next: Partial<BugDraft>) => {
    setDraft((current) => (current ? { ...current, ...next } : current));
  };

  const dirty = Boolean(bug && draft && !draftMatchesBug(draft, bug));
  const titleInvalid = Boolean(draft && draft.title.trim().length < 3);

  const save = async () => {
    if (!bug || !draft) return;
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await apiUpdateBug(bug.id, draftToUpdateInput(draft));
      await mutate("/api/bugs");
      setDraft(draftFromBug(updated));
      toast.success("Bug updated", { description: updated.title });
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not update the bug",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!bug) return;
    setDeleting(true);
    try {
      await apiDeleteBug(bug.id);
      await mutate("/api/bugs");
      toast.success("Bug deleted", { description: bug.title });
      reset();
      closeBug();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not delete the bug",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={Boolean(bug)} onOpenChange={handleOpenChange}>
      <DialogContent side="right" className="p-0">
        {bug && draft ? (
          <>
            <div className="shrink-0 border-b border-line px-6 pb-5 pr-14 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-faint">
                  Bug detail
                </span>
                <span className="font-mono text-[9.5px] text-line-strong">/</span>
                <SourceBadge reportedBy={bug.reportedBy} />
              </div>

              <DialogTitle className="sr-only">{bug.title}</DialogTitle>
              <DialogDescription className="sr-only">
                View and edit this bug.
              </DialogDescription>

              <input
                aria-label="Bug title"
                value={draft.title}
                onChange={(event) => patch({ title: event.target.value })}
                maxLength={160}
                className="mt-2.5 w-full border-b border-transparent bg-transparent pb-1 text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
              />

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                <span>{bug.id}</span>
                <span>Filed {formatDateTime(bug.createdAt)}</span>
                <span>Updated {relativeTime(bug.updatedAt)}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={draft.severity} />
                <CategoryChip category={draft.category} />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <ClassificationFields
                draft={draft}
                onChange={patch}
                idPrefix="drawer"
              />

              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-[12px] text-critical"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-line px-6 py-4">
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-ink">
                    Delete this bug permanently?
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                    >
                      Keep
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={remove}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                    Delete
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    {dirty && !titleInvalid ? (
                      <span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-faint sm:inline">
                        Unsaved
                      </span>
                    ) : null}
                    <DialogClose asChild>
                      <Button size="sm">Close</Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={save}
                      disabled={!dirty || titleInvalid || saving}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
