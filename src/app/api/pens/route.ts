import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Pen } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const pens = db
      .prepare("SELECT * FROM pens WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as Pen[];
    return NextResponse.json(pens);
  } catch {
    return NextResponse.json({ error: "Failed to fetch pens" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const data = await request.json();
    const stmt = db.prepare(`
      INSERT INTO pens (
        brand, model, color, nib_size, nib_material, nib_type, fill_system,
        date_purchased, purchase_price, purchase_location, current_ink,
        condition, notes, image_url, rating, is_daily_carry, provenance, storage_location, user_id
      ) VALUES (
        @brand, @model, @color, @nib_size, @nib_material, @nib_type, @fill_system,
        @date_purchased, @purchase_price, @purchase_location, @current_ink,
        @condition, @notes, @image_url, @rating, @is_daily_carry, @provenance, @storage_location, @user_id
      )
    `);
    const result = stmt.run({ is_daily_carry: 0, provenance: "", storage_location: "", ...data, user_id: userId });
    const pen = db
      .prepare("SELECT * FROM pens WHERE id = ?")
      .get(result.lastInsertRowid) as Pen;
    return NextResponse.json(pen, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create pen" }, { status: 500 });
  }
}
