import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

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

    const tags = db.prepare("SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag").all(parseInt(id)) as { tag: string }[];
    return NextResponse.json(tags.map((t) => t.tag));
  } catch {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
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
    const penId = parseInt(id);
    const pen = db.prepare("SELECT id FROM pens WHERE id = ? AND user_id = ?").get(penId, userId);
    if (!pen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { tag } = await request.json();
    const existing = db.prepare("SELECT id FROM pen_tags WHERE pen_id = ? AND tag = ?").get(penId, tag);
    if (!existing) {
      db.prepare("INSERT INTO pen_tags (pen_id, tag) VALUES (?, ?)").run(penId, tag);
    }
    const tags = db.prepare("SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag").all(penId) as { tag: string }[];
    return NextResponse.json(tags.map((t) => t.tag));
  } catch {
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    const penId = parseInt(id);
    const pen = db.prepare("SELECT id FROM pens WHERE id = ? AND user_id = ?").get(penId, userId);
    if (!pen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { tag } = await request.json();
    db.prepare("DELETE FROM pen_tags WHERE pen_id = ? AND tag = ?").run(penId, tag);
    const tags = db.prepare("SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag").all(penId) as { tag: string }[];
    return NextResponse.json(tags.map((t) => t.tag));
  } catch {
    return NextResponse.json({ error: "Failed to remove tag" }, { status: 500 });
  }
}
