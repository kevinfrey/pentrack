import { NextResponse } from "next/server";
import db from "@/lib/db";
import { InkEntry } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = db
    .prepare(
      "SELECT * FROM ink_history WHERE pen_id = ? ORDER BY inked_date DESC, created_at DESC"
    )
    .all(parseInt(id)) as InkEntry[];
  return NextResponse.json(entries);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const penId = parseInt(id);
  const { ink_name, inked_date, notes } = await request.json();

  const result = db
    .prepare(
      "INSERT INTO ink_history (pen_id, ink_name, inked_date, notes) VALUES (?, ?, ?, ?)"
    )
    .run(penId, ink_name, inked_date, notes || "");

  // Keep current_ink on the pen in sync with the most recent ink entry
  db.prepare(
    "UPDATE pens SET current_ink = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(ink_name, penId);

  const entry = db
    .prepare("SELECT * FROM ink_history WHERE id = ?")
    .get(result.lastInsertRowid) as InkEntry;
  return NextResponse.json(entry, { status: 201 });
}
