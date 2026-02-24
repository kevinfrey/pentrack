import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { InkEntry } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const pen = db.prepare("SELECT id FROM pens WHERE id = ? AND user_id = ?").get(parseInt(id), userId);
  if (!pen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entries = db
    .prepare("SELECT * FROM ink_history WHERE pen_id = ? ORDER BY inked_date DESC, created_at DESC")
    .all(parseInt(id)) as InkEntry[];
  return NextResponse.json(entries);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const penId = parseInt(id);

  const pen = db.prepare("SELECT id FROM pens WHERE id = ? AND user_id = ?").get(penId, userId);
  if (!pen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { ink_name, inked_date, notes } = await request.json();

  const result = db
    .prepare("INSERT INTO ink_history (pen_id, ink_name, inked_date, notes) VALUES (?, ?, ?, ?)")
    .run(penId, ink_name, inked_date, notes || "");

  db.prepare("UPDATE pens SET current_ink = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(ink_name, penId);

  const entry = db
    .prepare("SELECT * FROM ink_history WHERE id = ?")
    .get(result.lastInsertRowid) as InkEntry;
  return NextResponse.json(entry, { status: 201 });
}
