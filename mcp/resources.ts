import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listBugs } from "../lib/db/repo";
import { bugQuadrant, formatPriorityScore, isPending, rankBugs } from "../lib/domain/priority";
import { summarize } from "../lib/domain/stats";
import { GUIDELINES_MARKDOWN } from "./guidelines";

export function registerBugBoardResources(server: McpServer) {
  server.registerResource(
    "Triage guidelines",
    "bugboard://guidelines",
    {
      title: "Bug Board triage guidelines",
      description:
        "Severity, effort, category, and priority quadrant rubrics used to fill the board consistently.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: GUIDELINES_MARKDOWN,
        },
      ],
    }),
  );

  server.registerResource(
    "Board summary",
    "bugboard://summary",
    {
      title: "Current board summary",
      description:
        "Live counts and the top pending quick wins, as JSON.",
      mimeType: "application/json",
    },
    async (uri) => {
      const all = listBugs();
      const summary = summarize(all);
      const pending = rankBugs(all.filter((bug) => isPending(bug.status)));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                generatedAt: new Date().toISOString(),
                summary,
                topQuickWins: pending
                  .filter((bug) => bugQuadrant(bug) === "quick_win")
                  .slice(0, 5)
                  .map((bug) => ({
                    ...bug,
                    quadrant: bugQuadrant(bug),
                    priorityScore: formatPriorityScore(bug.severity, bug.effort),
                  })),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
