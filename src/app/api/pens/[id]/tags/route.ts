import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tags = db.prepare(
      "SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag"
    ).all(parseInt(id)) as { tag: string }[];
    return NextResponse.json(tags.map((t) => t.tag));
  } catch {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { tag } = await request.json();
    const penId = parseInt(id);
    // Check if tag already exists
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
  const { id } = await params;
  try {
    const { tag } = await request.json();
    const penId = parseInt(id);
    db.prepare("DELETE FROM pen_tags WHERE pen_id = ? AND tag = ?").run(penId, tag);
    const tags = db.prepare("SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag").all(penId) as { tag: string }[];
    return NextResponse.json(tags.map((t) => t.tag));
  } catch {
    return NextResponse.json({ error: "Failed to remove tag" }, { status: 500 });
  }
}
