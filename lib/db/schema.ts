import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type {
  BugStatus,
  Category,
  Effort,
  Severity,
} from "../domain/constants";

export const bugs = sqliteTable(
  "bugs",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    severity: text("severity").$type<Severity>().notNull().default("medium"),
    effort: integer("effort").$type<Effort>().notNull().default(3),
    category: text("category").$type<Category>().notNull().default("other"),
    status: text("status").$type<BugStatus>().notNull().default("open"),
    reportedBy: text("reported_by").notNull().default("human"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("idx_bugs_status").on(table.status),
    index("idx_bugs_severity").on(table.severity),
    index("idx_bugs_created_at").on(table.createdAt),
  ],
);

export type BugRow = typeof bugs.$inferSelect;
export type NewBugRow = typeof bugs.$inferInsert;
