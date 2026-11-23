import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MCP_INSTRUCTIONS } from "./instructions";
import { registerBugBoardResources } from "./resources";
import { registerBugBoardTools } from "./tools";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "bug-board", version: "0.1.0" },
    { instructions: MCP_INSTRUCTIONS },
  );

  registerBugBoardTools(server);
  registerBugBoardResources(server);

  return server;
}
