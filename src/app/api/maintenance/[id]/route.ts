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
    const entry = db.prepare(`
      SELECT ml.id FROM maintenance_log ml
      JOIN pens p ON p.id = ml.pen_id
      WHERE ml.id = ? AND p.user_id = ?
    `).get(parseInt(id), userId);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    db.prepare("DELETE FROM maintenance_log WHERE id = ?").run(parseInt(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete maintenance entry" }, { status: 500 });
  }
}
