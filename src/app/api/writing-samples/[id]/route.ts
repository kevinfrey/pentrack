import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    // Verify ownership through parent pen
    const sample = db.prepare(`
      SELECT ws.id FROM writing_samples ws
      JOIN pens p ON p.id = ws.pen_id
      WHERE ws.id = ? AND p.user_id = ?
    `).get(parseInt(id), userId);
    if (!sample) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.prepare("DELETE FROM writing_samples WHERE id = ?").run(parseInt(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete writing sample" }, { status: 500 });
  }
}
