"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import { useBugBoard } from "@/components/bugboard-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiCreateBug } from "@/lib/client-api";
import {
  ClassificationFields,
  TitleInput,
  draftToCreateInput,
  emptyDraft,
  validateDraft,
  type BugDraft,
} from "./bug-form";

export function NewBugDialog() {
  const { newBugOpen, setNewBugOpen } = useBugBoard();

  return (
    <Dialog open={newBugOpen} onOpenChange={setNewBugOpen}>
      <DialogContent className="max-w-2xl p-0">
        <NewBugForm onClose={() => setNewBugOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function NewBugForm({ onClose }: { onClose: () => void }) {
  const [draft, setDraft] = useState<BugDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (next: Partial<BugDraft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const bug = await apiCreateBug(draftToCreateInput(draft));
      await mutate("/api/bugs");
      toast.success("Bug filed", { description: bug.title });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not file the bug",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[88dvh] flex-col">
      <div className="border-b border-line px-6 pb-5 pr-12 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          New bug
        </p>
        <DialogTitle className="mt-1 text-lg font-semibold tracking-[-0.01em]">
          File a bug
        </DialogTitle>
        <DialogDescription className="mt-1 text-[12px] leading-relaxed text-muted">
          Attributed to you. Bugs filed by AI appear here through MCP.
        </DialogDescription>
      </div>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <TitleInput
              id="new-bug-title"
              value={draft.title}
              onChange={(title) => patch({ title })}
            />
          </div>

          <ClassificationFields
            draft={draft}
            onChange={patch}
            idPrefix="new-bug"
          />

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-[12px] text-critical"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <p className="hidden max-w-[260px] text-[10.5px] leading-relaxed text-faint sm:block">
            Severity and effort decide where this bug lands on the priority
            matrix.
          </p>
          <div className="ml-auto flex items-center gap-2">
            <DialogClose asChild>
              <Button size="sm">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={saving || draft.title.trim().length < 3}
            >
              {saving ? "Filing…" : "File bug"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
