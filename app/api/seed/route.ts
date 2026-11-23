import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/db/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = seedDemoData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to seed demo data", error);
    return NextResponse.json({ error: "Could not seed the board" }, { status: 500 });
  }
}
