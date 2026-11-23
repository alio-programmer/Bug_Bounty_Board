# Bug Board

A local-first bug triage board. AI clients file bugs through MCP, and an effort × severity matrix shows what deserves attention first.

Everything lives in one SQLite file. The web app, the stdio MCP server, and the HTTP MCP endpoint all read and write the same data.

## What it does

- **MCP for AI**: file, search, update, and delete bugs over stdio or Streamable HTTP.
- **Gain ÷ effort triage**: every bug is placed in a quadrant — Quick wins, Big bets, Fill-ins, or Time sinks.
- **Dashboard**: priority scatter matrix, severity donut, status pipeline, category bars, 14-day filing trend, and a ranked “Fix these next” queue.
- **Board**: the same bugs grouped by Priority, Effort, Status, or Severity.
- **Shared filters**: search, severity, effort, category, status, and priority filters stay in the URL across pages.
- **Two themes**: warm obsidian dark and alabaster light, with flat 1px surfaces and monospace metrics.
- **Live updates**: SWR polls every 5 seconds, so AI-filed bugs appear without a reload.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts · SQLite + Drizzle · MCP TypeScript SDK · Zod · SWR

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The board starts empty. Use **Load demo bugs** on the empty dashboard, or seed from the terminal:

```bash
npm run db:seed          # seed only if the board is empty
npm run db:seed -- --force   # replace all bugs with the demo set
```

The database is created automatically at `data/bugboard.db`.

## Connect an AI client

Click **Connect AI** in the app header for ready-to-paste configs with this project's absolute paths.

### OpenCode — local stdio

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "bug-board": {
      "type": "local",
      "command": [
        "/absolute/path/to/Bug Board/node_modules/.bin/tsx",
        "/absolute/path/to/Bug Board/mcp/server.ts"
      ],
      "enabled": true
    }
  }
}
```

On Windows use `node_modules/.bin/tsx.cmd`. The stdio server does not need the web app to be running.

### Claude Desktop

Add this to `claude_desktop_config.json` and restart Claude Desktop:

```json
{
  "mcpServers": {
    "bug-board": {
      "command": "/absolute/path/to/Bug Board/node_modules/.bin/tsx",
      "args": ["/absolute/path/to/Bug Board/mcp/server.ts"]
    }
  }
}
```

### Remote Streamable HTTP

Start the app, then point any Streamable HTTP MCP client at:

```
http://localhost:3000/api/mcp
```

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "bug-board": {
      "type": "remote",
      "url": "http://localhost:3000/api/mcp",
      "enabled": true
    }
  }
}
```

Set `BUGBOARD_MCP_TOKEN` to require `Authorization: Bearer <token>` on this endpoint. The web UI itself has no login; keep the server on localhost or behind your own access layer.

## MCP tools

| Tool | Purpose |
| --- | --- |
| `create_bug` | File one bug. Requires `title`, `severity`, and `effort`. |
| `create_bugs` | File up to 50 bugs in one transaction. |
| `list_bugs` | Search and filter the board; returns quadrants and priority scores. |
| `get_bug` | Read one full bug record. |
| `update_bug` | Change any field, including status. |
| `delete_bug` | Permanently remove a bug. Destructive. |
| `get_board_summary` | Counts plus top quick wins and open critical bugs. |
| `get_next_bugs` | Highest-return pending bugs to fix next. |

Resources:

- `bugboard://guidelines` — the severity, effort, category, and quadrant rubric.
- `bugboard://summary` — live counts and top quick wins as JSON.

## Triage rubric

**Severity** is the gain axis: `critical` (4), `high` (3), `medium` (2), `low` (1).

**Effort** is an engineering estimate from 1 (under 30 minutes) to 5 (a week or more).

| Quadrant | Rule | Action |
| --- | --- | --- |
| Quick wins | critical/high + effort 1–2 | Do these first |
| Big bets | critical/high + effort 3–5 | Plan and staff |
| Fill-ins | medium/low + effort 1–2 | Batch when idle |
| Time sinks | medium/low + effort 3–5 | Deprioritize |

The priority score is `severity weight ÷ effort`. The board sorts by quadrant, then severity, then lowest effort, then newest.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the web app (and the HTTP MCP route). |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm run mcp` | Run the MCP server over stdio. |
| `npm run db:seed` | Seed demo data (`-- --force` to replace). |
| `npm test` | Run the domain unit tests. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript with no emit. |

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `BUGBOARD_DB_PATH` | `./data/bugboard.db` | SQLite file location. Relative paths resolve from the process working directory. |
| `BUGBOARD_MCP_TOKEN` | unset | When set, `/api/mcp` requires a matching bearer token. |

Copy `.env.example` to `.env.local` to set them locally.

## Keyboard shortcuts

- `/` — focus search
- `n` — open the new bug dialog

## Architecture

```
app/                 App Router pages, REST routes, MCP HTTP route
components/          Dashboard, board, filters, bug editor, UI primitives
lib/domain/          Constants, priority logic, filters, statistics, types
lib/db/              Drizzle schema, SQLite client, repository, demo seed
lib/validation.ts    Zod schemas shared by REST, MCP, and the UI
mcp/                 Shared MCP server, tools, resources, instructions, stdio entry
scripts/             Seed CLI
tests/               Domain unit tests
data/                SQLite database (ignored by git)
```

The UI never talks to SQLite directly. Server components and route handlers call the repository; the browser talks to `/api/bugs` and `/api/summary`. Both MCP transports call the same repository, so every client sees one consistent board.

The database uses WAL mode and a 5-second busy timeout, which keeps the web app responsive while an MCP client writes.
