import { NextResponse } from "next/server";
import { createBug, listBugs } from "@/lib/db/repo";
import { createBugSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      bugs: listBugs(),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to list bugs", error);
    return NextResponse.json(
      { error: "Could not read the bug database" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBugSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid bug", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ bug: createBug(parsed.data) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bug", error);
    return NextResponse.json({ error: "Could not create the bug" }, { status: 500 });
  }
}
