import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { InkBottle } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const inks = db
      .prepare("SELECT * FROM ink_bottles WHERE user_id = ? ORDER BY brand, name")
      .all(userId) as InkBottle[];
    return NextResponse.json(inks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ink bottles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const data = await request.json();
    const result = db.prepare(`
      INSERT INTO ink_bottles (name, brand, color_description, type, bottle_size_ml, remaining_pct, notes, swatch_url, user_id)
      VALUES (@name, @brand, @color_description, @type, @bottle_size_ml, @remaining_pct, @notes, @swatch_url, @user_id)
    `).run({ ...data, user_id: userId });
    const ink = db.prepare("SELECT * FROM ink_bottles WHERE id = ?").get(result.lastInsertRowid) as InkBottle;
    return NextResponse.json(ink, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ink bottle" }, { status: 500 });
  }
}
