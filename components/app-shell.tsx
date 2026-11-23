"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { PlugZap, Plus } from "lucide-react";
import { useBugBoard } from "./bugboard-context";
import { LiveIndicator } from "./live-indicator";
import { LogoMark, Wordmark } from "./logo";
import { NavTabs, NavTabsFallback } from "./nav-tabs";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { BugDrawer } from "./bugs/bug-drawer";
import { NewBugDialog } from "./bugs/new-bug-dialog";
import { ConnectDialog } from "./connect-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { setNewBugOpen, setConnectOpen } = useBugBoard();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        document.querySelector(
          '[role="dialog"], [role="listbox"], [role="menu"]',
        )
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='combobox']",
        )
      ) {
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
        return;
      }
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        setNewBugOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setNewBugOpen]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80]"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md"
          >
            <LogoMark />
            <Wordmark />
          </Link>

          <div className="ml-2 hidden sm:block">
            <Suspense fallback={<NavTabsFallback />}>
              <NavTabs />
            </Suspense>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <LiveIndicator />
            <div className="mx-1 hidden h-4 w-px bg-line lg:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConnectOpen(true)}
              aria-label="Connect AI"
            >
              <PlugZap size={14} strokeWidth={1.8} />
              <span className="hidden md:inline">Connect AI</span>
            </Button>
            <ThemeToggle />
            <Button
              size="sm"
              onClick={() => setNewBugOpen(true)}
              className="ml-1"
              title="New bug (N)"
            >
              <Plus size={14} strokeWidth={2} />
              <span className="hidden min-[420px]:inline">New bug</span>
              <span className="min-[420px]:hidden">New</span>
            </Button>
          </div>
        </div>

        <div className="border-t border-line px-4 py-1.5 sm:hidden">
          <Suspense fallback={<NavTabsFallback fullWidth />}>
            <NavTabs fullWidth />
          </Suspense>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 sm:py-8"
      >
        {children}
      </main>

      <footer className="mx-auto w-full max-w-[1440px] px-4 pb-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 font-mono text-[9.5px] uppercase tracking-[0.16em] text-faint">
          <span>Local-first · SQLite · AI via MCP</span>
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="transition-colors hover:text-ink"
          >
            MCP endpoint /api/mcp ↗
          </button>
        </div>
      </footer>

      <NewBugDialog />
      <BugDrawer />
      <ConnectDialog />
    </div>
  );
}
