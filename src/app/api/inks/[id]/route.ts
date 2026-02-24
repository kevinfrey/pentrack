import { NextResponse } from "next/server";
import db from "@/lib/db";
import { InkEntry } from "@/lib/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entry = db
    .prepare("SELECT * FROM ink_history WHERE id = ?")
    .get(parseInt(id)) as InkEntry | undefined;

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM ink_history WHERE id = ?").run(parseInt(id));

  // Recalculate current_ink from the remaining most recent entry
  const mostRecent = db
    .prepare(
      "SELECT ink_name FROM ink_history WHERE pen_id = ? ORDER BY inked_date DESC, created_at DESC LIMIT 1"
    )
    .get(entry.pen_id) as { ink_name: string } | undefined;

  db.prepare(
    "UPDATE pens SET current_ink = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(mostRecent?.ink_name ?? "", entry.pen_id);

  return NextResponse.json({ success: true });
}
