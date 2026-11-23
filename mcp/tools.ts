import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createBug, createBugs, deleteBug, getBug, listBugs, updateBug } from "../lib/db/repo";
import {
  BUG_STATUSES,
  CATEGORIES,
  QUADRANTS,
  QUADRANT_META,
  SEVERITIES,
  SEVERITY_META,
  type BugStatus,
  type Category,
  type Quadrant,
  type Severity,
} from "../lib/domain/constants";
import { filterBugs, type BugFilters } from "../lib/domain/filters";
import {
  bugQuadrant,
  formatPriorityScore,
  isPending,
  rankBugs,
} from "../lib/domain/priority";
import { summarize } from "../lib/domain/stats";
import type { Bug } from "../lib/domain/types";
import {
  bulkCreateBugsSchema,
  createBugSchema,
  updateBugFieldsSchema,
  updateBugSchema,
} from "../lib/validation";

const MAX_LIST = 200;

function text(value: string) {
  return { content: [{ type: "text" as const, text: value }] };
}

function json(value: unknown) {
  return text(JSON.stringify(value, null, 2));
}

function failure(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

function decorate(bug: Bug) {
  const quadrant = bugQuadrant(bug);
  return {
    ...bug,
    quadrant,
    quadrantLabel: QUADRANT_META[quadrant].label,
    priorityScore: formatPriorityScore(bug.severity, bug.effort),
  };
}

function compact(bug: Bug) {
  return {
    ...decorate(bug),
    description:
      bug.description.length > 320
        ? `${bug.description.slice(0, 317)}...`
        : bug.description,
  };
}

function appliedFilters(filters: BugFilters): BugFilters {
  return filters;
}

export function registerBugBoardTools(server: McpServer) {
  server.registerTool(
    "create_bug",
    {
      title: "File a bug",
      description:
        "Create a bug on the Bug Board. Required: title, severity, effort. Severity: critical|high|medium|low. Effort: 1 (trivial) to 5 (epic). Use after checking list_bugs for duplicates. Read bugboard://guidelines for the rubric.",
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: createBugSchema,
    },
    async (args) => {
      const bug = createBug({ ...args, reportedBy: args.reportedBy ?? "AI" });
      return json({
        message: `Filed ${bug.id}`,
        bug: decorate(bug),
      });
    },
  );

  server.registerTool(
    "create_bugs",
    {
      title: "File many bugs",
      description:
        "Create up to 50 bugs in one transaction. Each item accepts title, description, severity, effort, category, status, reportedBy. Use for batch triage of a pasted list.",
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: bulkCreateBugsSchema,
    },
    async (args) => {
      const created = createBugs(
        args.bugs.map((bug) => ({ ...bug, reportedBy: bug.reportedBy ?? "AI" })),
      );
      return json({
        message: `Filed ${created.length} bugs`,
        bugs: created.map(decorate),
      });
    },
  );

  const listSchema = z.object({
    query: z
      .string()
      .optional()
      .describe("Case-insensitive text search across title, description, and id"),
    severity: z.enum(SEVERITIES).optional().describe("Filter by severity"),
    effort: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe("Filter by effort level 1-5"),
    category: z.enum(CATEGORIES).optional().describe("Filter by category"),
    status: z.enum(BUG_STATUSES).optional().describe("Filter by workflow status"),
    quadrant: z
      .enum(QUADRANTS)
      .optional()
      .describe("Filter by priority quadrant (quick_win, big_bet, fill_in, time_sink)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_LIST)
      .optional()
      .describe(`Maximum bugs to return (default 50, max ${MAX_LIST})`),
  });

  server.registerTool(
    "list_bugs",
    {
      title: "List and search bugs",
      description:
        "Search and filter the board. Returns compact bug records with computed quadrant and priority score. Use to find duplicates or inspect the backlog.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: listSchema,
    },
    async (args) => {
      const filters = appliedFilters({
        q: args.query ?? "",
        severity: args.severity ? [args.severity as Severity] : [],
        effort: args.effort ? [args.effort as BugFilters["effort"][number]] : [],
        category: args.category ? [args.category as Category] : [],
        status: args.status ? [args.status as BugStatus] : [],
        quadrant: args.quadrant ? [args.quadrant as Quadrant] : [],
      });
      const all = listBugs();
      const matching = rankBugs(filterBugs(all, filters));
      const limit = args.limit ?? 50;
      return json({
        totalMatching: matching.length,
        returned: Math.min(limit, matching.length),
        bugs: matching.slice(0, limit).map(compact),
      });
    },
  );

  server.registerTool(
    "get_bug",
    {
      title: "Get a bug",
      description:
        "Read the full record for one bug, including its description, classification, timestamps, reporter, and priority score.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: z.object({ id: z.string().min(1).describe("Bug id, e.g. bug_abc123") }),
    },
    async ({ id }) => {
      const bug = getBug(id);
      if (!bug) return failure(`No bug found with id ${id}`);
      return json(decorate(bug));
    },
  );

  const updateSchema = z.object({
    id: z.string().min(1),
    ...updateBugFieldsSchema.shape,
  });

  server.registerTool(
    "update_bug",
    {
      title: "Update a bug",
      description:
        "Update one or more fields on an existing bug. Mark status 'fixed' only when the user confirms it. Use this to correct severity, effort, or category after triage.",
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: updateSchema,
    },
    async ({ id, ...patch }) => {
      if (Object.keys(patch).length === 0) {
        return failure("Provide at least one field to update");
      }
      const parsed = updateBugSchema.safeParse(patch);
      if (!parsed.success) {
        return failure(
          `Invalid update: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`,
        );
      }
      const updated = updateBug(id, parsed.data);
      if (!updated) return failure(`No bug found with id ${id}`);
      return json({ message: `Updated ${id}`, bug: decorate(updated) });
    },
  );

  server.registerTool(
    "delete_bug",
    {
      title: "Delete a bug",
      description:
        "Permanently delete a bug. This is destructive and cannot be undone. Only call when the user explicitly asks to delete it.",
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: z.object({ id: z.string().min(1).describe("Bug id to delete") }),
    },
    async ({ id }) => {
      const bug = getBug(id);
      if (!bug) return failure(`No bug found with id ${id}`);
      const deleted = deleteBug(id);
      if (!deleted) return failure(`Could not delete ${id}`);
      return json({ message: `Deleted ${id}`, deleted: { id, title: bug.title } });
    },
  );

  server.registerTool(
    "get_board_summary",
    {
      title: "Get board summary",
      description:
        "Get counts by severity, category, status, and priority quadrant, plus top quick wins and critical bugs. Use to orient before recommending what to work on.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const all = listBugs();
      const summary = summarize(all);
      const pending = rankBugs(all.filter((bug) => isPending(bug.status)));
      const quickWins = pending
        .filter((bug) => bugQuadrant(bug) === "quick_win")
        .slice(0, 5)
        .map(decorate);
      const critical = pending
        .filter((bug) => bug.severity === "critical")
        .slice(0, 5)
        .map(decorate);

      return json({
        generatedAt: new Date().toISOString(),
        summary,
        severityLabels: Object.fromEntries(
          SEVERITIES.map((severity) => [severity, SEVERITY_META[severity].label]),
        ),
        topQuickWins: quickWins,
        openCritical: critical,
      });
    },
  );

  server.registerTool(
    "get_next_bugs",
    {
      title: "Recommend next bugs",
      description:
        "Return the highest-return bugs to fix next, ranked by quadrant then severity and effort. Focuses on pending (open or in-progress) bugs by default.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("How many bugs to return (default 5)"),
        includeFixed: z
          .boolean()
          .optional()
          .describe("Include fixed and won't-fix bugs (default false)"),
        quadrant: z
          .enum(QUADRANTS)
          .optional()
          .describe("Restrict to one quadrant"),
      }),
    },
    async ({ limit, includeFixed, quadrant }) => {
      const all = listBugs().filter((bug) => includeFixed || isPending(bug.status));
      const filtered = quadrant
        ? all.filter((bug) => bugQuadrant(bug) === quadrant)
        : all;
      const ranked = rankBugs(filtered).slice(0, limit ?? 5);
      return json({
        message:
          ranked.length === 0
            ? "No matching pending bugs"
            : `Top ${ranked.length} bugs to address next`,
        bugs: ranked.map(decorate),
      });
    },
  );
}
