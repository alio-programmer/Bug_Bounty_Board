import { z } from "zod";
import {
  BUG_STATUSES,
  CATEGORIES,
  SEVERITIES,
  type Effort,
} from "./domain/constants";

export const severitySchema = z.enum(SEVERITIES);
export const categorySchema = z.enum(CATEGORIES);
export const statusSchema = z.enum(BUG_STATUSES);
export const effortSchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .transform((value) => value as Effort);

const titleSchema = z
  .string()
  .trim()
  .min(3, "Give the bug a clear title (at least 3 characters)")
  .max(160, "Keep the title under 160 characters");

const descriptionSchema = z
  .string()
  .trim()
  .max(10_000, "Keep the description under 10,000 characters");

export const createBugSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional().default(""),
  severity: severitySchema,
  effort: effortSchema,
  category: categorySchema.optional().default("other"),
  status: statusSchema.optional().default("open"),
  reportedBy: z.string().trim().max(80).optional(),
});

export const updateBugFieldsSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  severity: severitySchema.optional(),
  effort: effortSchema.optional(),
  category: categorySchema.optional(),
  status: statusSchema.optional(),
  reportedBy: z.string().trim().max(80).optional(),
});

export const updateBugSchema = updateBugFieldsSchema.refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update" },
);

export const bulkCreateBugsSchema = z.object({
  bugs: z.array(createBugSchema).min(1).max(50),
});

export type CreateBugInput = z.infer<typeof createBugSchema>;
export type UpdateBugInput = z.infer<typeof updateBugSchema>;
