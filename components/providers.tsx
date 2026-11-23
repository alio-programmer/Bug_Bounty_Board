"use client";

import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { BugBoardProvider } from "./bugboard-context";

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          boxShadow: "none",
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  );
}

export function Providers({
  children,
  projectPath,
}: {
  children: ReactNode;
  projectPath: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SWRConfig
        value={{
          fetcher,
          refreshInterval: 5000,
          revalidateOnFocus: true,
          dedupingInterval: 1500,
        }}
      >
        <BugBoardProvider projectPath={projectPath}>
          {children}
        </BugBoardProvider>
        <ThemedToaster />
      </SWRConfig>
    </ThemeProvider>
  );
}
