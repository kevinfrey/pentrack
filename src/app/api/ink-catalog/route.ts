import { NextResponse } from "next/server";
import db from "@/lib/db";
import { InkBottle } from "@/lib/types";

export async function GET() {
  try {
    const inks = db
      .prepare("SELECT * FROM ink_bottles ORDER BY brand, name")
      .all() as InkBottle[];
    return NextResponse.json(inks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ink bottles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = db.prepare(`
      INSERT INTO ink_bottles (name, brand, color_description, type, bottle_size_ml, remaining_pct, notes, swatch_url)
      VALUES (@name, @brand, @color_description, @type, @bottle_size_ml, @remaining_pct, @notes, @swatch_url)
    `).run(data);
    const ink = db.prepare("SELECT * FROM ink_bottles WHERE id = ?").get(result.lastInsertRowid) as InkBottle;
    return NextResponse.json(ink, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ink bottle" }, { status: 500 });
  }
}
