import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import BetterSqlite3 from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type BugBoardDb = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as {
  __bugboardDb?: BugBoardDb;
};

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS bugs (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    severity TEXT NOT NULL DEFAULT 'medium'
      CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    effort INTEGER NOT NULL DEFAULT 3
      CHECK (effort BETWEEN 1 AND 5),
    category TEXT NOT NULL DEFAULT 'other'
      CHECK (category IN ('ui', 'backend', 'performance', 'security', 'data', 'infra', 'docs', 'other')),
    status TEXT NOT NULL DEFAULT 'open'
      CHECK (status IN ('open', 'in_progress', 'fixed', 'wontfix')),
    reported_by TEXT NOT NULL DEFAULT 'human',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
  CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
  CREATE INDEX IF NOT EXISTS idx_bugs_created_at ON bugs(created_at);
`;

function resolveDatabasePath(): string {
  const configured = process.env.BUGBOARD_DB_PATH;
  if (!configured) return join(process.cwd(), "data", "bugboard.db");
  return isAbsolute(configured)
    ? configured
    : resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

function createDatabase(): BugBoardDb {
  const databasePath = resolveDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });

  const sqlite = new BetterSqlite3(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(SCHEMA_SQL);

  return drizzle(sqlite, { schema });
}

export function getDb(): BugBoardDb {
  if (!globalForDb.__bugboardDb) {
    globalForDb.__bugboardDb = createDatabase();
  }
  return globalForDb.__bugboardDb;
}

export function getDatabasePath(): string {
  return resolveDatabasePath();
}
