"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, TerminalSquare } from "lucide-react";
import { toast } from "sonner";
import { useBugBoard } from "@/components/bugboard-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TabKey = "opencode" | "claude" | "http";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "opencode", label: "OpenCode · local" },
  { key: "claude", label: "Claude Desktop" },
  { key: "http", label: "Remote HTTP" },
];

function CodeBlock({
  code,
  label,
  onCopy,
  copied,
}: {
  code: string;
  label: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-canvas">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          {copied ? (
            <Check size={12} strokeWidth={2} />
          ) : (
            <Copy size={12} strokeWidth={1.8} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-64 overflow-auto p-3 font-mono text-[10.5px] leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ConnectDialog() {
  const { connectOpen, setConnectOpen, projectPath } = useBugBoard();
  const [tab, setTab] = useState<TabKey>("opencode");
  const [copied, setCopied] = useState<string | null>(null);
  const origin =
    typeof window === "undefined"
      ? "http://localhost:3000"
      : window.location.origin;

  const handleOpenChange = (open: boolean) => {
    setCopied(null);
    setConnectOpen(open);
  };

  const isWindows = /^[A-Za-z]:\//.test(projectPath);
  const tsxBin = isWindows
    ? `${projectPath}/node_modules/.bin/tsx.cmd`
    : `${projectPath}/node_modules/.bin/tsx`;

  const opencodeConfig = useMemo(
    () =>
      JSON.stringify(
        {
          $schema: "https://opencode.ai/config.json",
          mcp: {
            "bug-board": {
              type: "local",
              command: [tsxBin, `${projectPath}/mcp/server.ts`],
              enabled: true,
            },
          },
        },
        null,
        2,
      ),
    [projectPath, tsxBin],
  );

  const claudeConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            "bug-board": {
              command: tsxBin,
              args: [`${projectPath}/mcp/server.ts`],
            },
          },
        },
        null,
        2,
      ),
    [projectPath, tsxBin],
  );

  const remoteUrl = `${origin}/api/mcp`;

  const remoteOpencodeConfig = useMemo(
    () =>
      JSON.stringify(
        {
          $schema: "https://opencode.ai/config.json",
          mcp: {
            "bug-board": {
              type: "remote",
              url: remoteUrl,
              enabled: true,
            },
          },
        },
        null,
        2,
      ),
    [remoteUrl],
  );

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Could not access the clipboard");
    }
  };

  return (
    <Dialog open={connectOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="pr-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-accent">
              <PlugZap size={14} strokeWidth={1.8} />
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              MCP connection
            </p>
          </div>
          <DialogTitle className="mt-3 text-lg font-semibold tracking-[-0.01em]">
            Connect your AI
          </DialogTitle>
          <DialogDescription className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted">
            Local clients use stdio; remote clients use Streamable HTTP. Both read
            and write the same SQLite database, so new bugs appear here within a
            few seconds.
          </DialogDescription>
        </div>

        <div className="mt-5 flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-0.5">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={
                tab === item.key
                  ? "flex h-8 flex-1 items-center justify-center rounded-md bg-raised px-2.5 text-[12px] font-medium text-ink"
                  : "flex h-8 flex-1 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {tab === "opencode" ? (
            <>
              <p className="text-[12px] leading-relaxed text-muted">
                Add this to your OpenCode config, or paste it into a project-level{" "}
                <code className="font-mono text-[11px] text-ink">opencode.json</code>{" "}
                and restart the session.
              </p>
              <CodeBlock
                label="opencode.json"
                code={opencodeConfig}
                copied={copied === "opencode"}
                onCopy={() => copy(opencodeConfig, "opencode")}
              />
            </>
          ) : null}

          {tab === "claude" ? (
            <>
              <p className="text-[12px] leading-relaxed text-muted">
                Add this to{" "}
                <code className="font-mono text-[11px] text-ink">
                  claude_desktop_config.json
                </code>{" "}
                and restart Claude Desktop. The file lives under AppData on
                Windows or Application Support on macOS.
              </p>
              <CodeBlock
                label="claude_desktop_config.json"
                code={claudeConfig}
                copied={copied === "claude"}
                onCopy={() => copy(claudeConfig, "claude")}
              />
            </>
          ) : null}

          {tab === "http" ? (
            <>
              <p className="text-[12px] leading-relaxed text-muted">
                Start the app with{" "}
                <code className="font-mono text-[11px] text-ink">npm run dev</code>{" "}
                and point any Streamable HTTP MCP client at this endpoint:
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5">
                <TerminalSquare size={14} className="shrink-0 text-faint" />
                <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink">
                  {remoteUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(remoteUrl, "url")}
                >
                  {copied === "url" ? <Check size={12} /> : <Copy size={12} />}
                  {copied === "url" ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
                OpenCode · remote config
              </p>
              <CodeBlock
                label="opencode.json"
                code={remoteOpencodeConfig}
                copied={copied === "remote"}
                onCopy={() => copy(remoteOpencodeConfig, "remote")}
              />
            </>
          ) : null}

          <div className="rounded-lg border border-line bg-raised/50 px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-muted">
              <span className="font-medium text-ink">Notes.</span> The stdio server
              does not require the web app to be running, but the HTTP endpoint
              does. If{" "}
              <code className="font-mono text-[10.5px] text-ink">
                BUGBOARD_MCP_TOKEN
              </code>{" "}
              is set, send it as{" "}
              <code className="font-mono text-[10.5px] text-ink">
                Authorization: Bearer &lt;token&gt;
              </code>
              . AI clients should read the{" "}
              <code className="font-mono text-[10.5px] text-ink">
                bugboard://guidelines
              </code>{" "}
              resource for the triage rubric.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
