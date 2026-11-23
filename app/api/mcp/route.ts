import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/mcp/server-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function unauthorized(): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null }),
    {
      status: 401,
      headers: {
        "content-type": "application/json",
        "www-authenticate": "Bearer",
      },
    },
  );
}

function checkAuth(request: Request): Response | null {
  const expected = process.env.BUGBOARD_MCP_TOKEN;
  if (!expected) return null;

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (header.startsWith(prefix) && header.slice(prefix.length) === expected) {
    return null;
  }
  return unauthorized();
}

async function handleRequest(request: Request): Promise<Response> {
  const authError = checkAuth(request);
  if (authError) return authError;

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}
