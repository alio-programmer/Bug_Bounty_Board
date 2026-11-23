import { NextResponse } from "next/server";
import { deleteBug, getBug, updateBug } from "@/lib/db/repo";
import { updateBugSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bug = getBug(id);
  if (!bug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  return NextResponse.json({ bug });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const parsed = updateBugSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const bug = updateBug(id, parsed.data);
    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }
    return NextResponse.json({ bug });
  } catch (error) {
    console.error("Failed to update bug", error);
    return NextResponse.json({ error: "Could not update the bug" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteBug(id);
  if (!deleted) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
