"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Columns3, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/format";

const TABS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/board", label: "Board", icon: Columns3 },
] as const;

function tabHref(href: string, query: string): string {
  if (!query) return href;
  return `${href}?${query}`;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavTabs({ fullWidth = false }: { fullWidth?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serialized = searchParams.toString();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "inline-flex rounded-lg border border-line bg-surface p-0.5",
        fullWidth && "flex w-full",
      )}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href, pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tabHref(tab.href, serialized)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
              fullWidth && "flex-1",
              active
                ? "bg-raised text-ink"
                : "text-muted hover:bg-raised/60 hover:text-ink",
            )}
          >
            <Icon size={14} strokeWidth={1.8} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavTabsFallback({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "inline-flex rounded-lg border border-line bg-surface p-0.5",
        fullWidth && "flex w-full",
      )}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted transition-colors hover:text-ink",
              fullWidth && "flex-1",
            )}
          >
            <Icon size={14} strokeWidth={1.8} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
