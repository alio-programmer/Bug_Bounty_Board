import type { Metadata } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Bug Board — effort-aware bug triage",
  description:
    "A local-first bug board where AI files bugs through MCP and effort × severity charts show what to fix next.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const projectPath = process.cwd().replaceAll("\\", "/");

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers projectPath={projectPath}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
