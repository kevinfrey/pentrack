import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { InkEntry } from "@/lib/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  // Verify ownership through parent pen
  const entry = db.prepare(`
    SELECT ih.id, ih.pen_id FROM ink_history ih
    JOIN pens p ON p.id = ih.pen_id
    WHERE ih.id = ? AND p.user_id = ?
  `).get(parseInt(id), userId) as (InkEntry & { pen_id: number }) | undefined;

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.prepare("DELETE FROM ink_history WHERE id = ?").run(parseInt(id));

  const mostRecent = db
    .prepare("SELECT ink_name FROM ink_history WHERE pen_id = ? ORDER BY inked_date DESC, created_at DESC LIMIT 1")
    .get(entry.pen_id) as { ink_name: string } | undefined;

  db.prepare("UPDATE pens SET current_ink = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(mostRecent?.ink_name ?? "", entry.pen_id);

  return NextResponse.json({ success: true });
}
