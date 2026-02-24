import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { WritingSample } from "@/lib/types";

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

    const samples = db.prepare(
      "SELECT * FROM writing_samples WHERE pen_id = ? ORDER BY created_at DESC"
    ).all(parseInt(id)) as WritingSample[];
    return NextResponse.json(samples);
  } catch {
    return NextResponse.json({ error: "Failed to fetch writing samples" }, { status: 500 });
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
      INSERT INTO writing_samples (pen_id, ink_name, paper, notes, image_url)
      VALUES (@pen_id, @ink_name, @paper, @notes, @image_url)
    `).run({ ...data, pen_id: parseInt(id) });
    const sample = db.prepare("SELECT * FROM writing_samples WHERE id = ?").get(result.lastInsertRowid) as WritingSample;
    return NextResponse.json(sample, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create writing sample" }, { status: 500 });
  }
}
