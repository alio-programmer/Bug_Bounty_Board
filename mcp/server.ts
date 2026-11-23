#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Anchor the SQLite file to this project, even when a desktop MCP client
// spawns the server from a different working directory.
process.env.BUGBOARD_DB_PATH ??= resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "bugboard.db",
);

const { createMcpServer } = await import("./server-core");

const server = createMcpServer();
const transport = new StdioServerTransport();

await server.connect(transport);

// stdout is reserved for MCP protocol traffic, so status goes to stderr.
console.error("Bug Board MCP server connected over stdio");
