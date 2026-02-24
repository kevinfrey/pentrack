import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { MaintenanceEntry } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    const pen = db.prepare("SELECT id FROM pens WHERE id = ? AND user_id = ?").get(parseInt(id), userId);
    if (!pen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const entries = db.prepare(
      "SELECT * FROM maintenance_log WHERE pen_id = ? ORDER BY date DESC, created_at DESC"
    ).all(parseInt(id)) as MaintenanceEntry[];
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance log" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    const pen = db.prepare("SELECT id FROM pens WHERE id = ? AND user_id = ?").get(parseInt(id), userId);
    if (!pen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = await request.json();
    const result = db.prepare(`
      INSERT INTO maintenance_log (pen_id, type, notes, date)
      VALUES (@pen_id, @type, @notes, @date)
    `).run({ ...data, pen_id: parseInt(id) });
    const entry = db.prepare("SELECT * FROM maintenance_log WHERE id = ?").get(result.lastInsertRowid) as MaintenanceEntry;
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create maintenance entry" }, { status: 500 });
  }
}
