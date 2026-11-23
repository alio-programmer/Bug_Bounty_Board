import { desc, eq, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import type { Bug } from "../domain/types";
import type { CreateBugInput, UpdateBugInput } from "../validation";
import { getDb } from "./client";
import { bugs, type BugRow, type NewBugRow } from "./schema";

const generateId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export function newBugId(): string {
  return `bug_${generateId()}`;
}

function toBug(row: BugRow): Bug {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    effort: row.effort,
    category: row.category,
    status: row.status,
    reportedBy: row.reportedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function listBugs(): Bug[] {
  return getDb()
    .select()
    .from(bugs)
    .orderBy(desc(bugs.createdAt))
    .all()
    .map(toBug);
}

export function getBug(id: string): Bug | null {
  const row = getDb().select().from(bugs).where(eq(bugs.id, id)).get();
  return row ? toBug(row) : null;
}

function toRow(input: CreateBugInput, createdAt: Date, updatedAt: Date): NewBugRow {
  return {
    id: newBugId(),
    title: input.title,
    description: input.description,
    severity: input.severity,
    effort: input.effort,
    category: input.category,
    status: input.status,
    reportedBy: input.reportedBy ?? "human",
    createdAt,
    updatedAt,
  };
}

export function createBug(input: CreateBugInput): Bug {
  const now = new Date();
  const row = getDb()
    .insert(bugs)
    .values(toRow(input, now, now))
    .returning()
    .get();
  return toBug(row);
}

export function createBugs(inputs: CreateBugInput[]): Bug[] {
  if (inputs.length === 0) return [];
  const now = new Date();
  return getDb()
    .insert(bugs)
    .values(inputs.map((input) => toRow(input, now, now)))
    .returning()
    .all()
    .map(toBug);
}

export function updateBug(id: string, input: UpdateBugInput): Bug | null {
  const values: Partial<NewBugRow> = { updatedAt: new Date() };
  if (input.title !== undefined) values.title = input.title;
  if (input.description !== undefined) values.description = input.description;
  if (input.severity !== undefined) values.severity = input.severity;
  if (input.effort !== undefined) values.effort = input.effort;
  if (input.category !== undefined) values.category = input.category;
  if (input.status !== undefined) values.status = input.status;
  if (input.reportedBy !== undefined) values.reportedBy = input.reportedBy;

  const row = getDb()
    .update(bugs)
    .set(values)
    .where(eq(bugs.id, id))
    .returning()
    .get();

  return row ? toBug(row) : null;
}

export function deleteBug(id: string): boolean {
  const result = getDb().delete(bugs).where(eq(bugs.id, id)).run();
  return result.changes > 0;
}

export function countBugs(): number {
  const row = getDb()
    .select({ count: sql<number>`count(*)` })
    .from(bugs)
    .get();
  return row?.count ?? 0;
}
