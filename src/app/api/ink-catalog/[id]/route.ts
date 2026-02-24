import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { InkBottle } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    const ink = db.prepare("SELECT * FROM ink_bottles WHERE id = ? AND user_id = ?").get(parseInt(id), userId) as InkBottle | undefined;
    if (!ink) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ink);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ink bottle" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    const data = await request.json();
    db.prepare(`
      UPDATE ink_bottles SET
        name = @name, brand = @brand, color_description = @color_description,
        type = @type, bottle_size_ml = @bottle_size_ml, remaining_pct = @remaining_pct,
        notes = @notes, swatch_url = @swatch_url
      WHERE id = @id AND user_id = @user_id
    `).run({ ...data, id: parseInt(id), user_id: userId });
    const ink = db.prepare("SELECT * FROM ink_bottles WHERE id = ? AND user_id = ?").get(parseInt(id), userId) as InkBottle;
    return NextResponse.json(ink);
  } catch {
    return NextResponse.json({ error: "Failed to update ink bottle" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    db.prepare("DELETE FROM ink_bottles WHERE id = ? AND user_id = ?").run(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete ink bottle" }, { status: 500 });
  }
}
