import { NextResponse } from "next/server";
import { listBugs } from "@/lib/db/repo";
import { summarize } from "@/lib/domain/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const summary = summarize(listBugs());
  return NextResponse.json({ summary });
}
