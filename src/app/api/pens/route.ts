import { NextResponse } from "next/server";
import db from "@/lib/db";
import { Pen } from "@/lib/types";

export async function GET() {
  try {
    const pens = db
      .prepare("SELECT * FROM pens ORDER BY created_at DESC")
      .all() as Pen[];
    return NextResponse.json(pens);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch pens" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const stmt = db.prepare(`
      INSERT INTO pens (
        brand, model, color, nib_size, nib_material, nib_type, fill_system,
        date_purchased, purchase_price, purchase_location, current_ink,
        condition, notes, image_url, rating, is_daily_carry, provenance, storage_location
      ) VALUES (
        @brand, @model, @color, @nib_size, @nib_material, @nib_type, @fill_system,
        @date_purchased, @purchase_price, @purchase_location, @current_ink,
        @condition, @notes, @image_url, @rating, @is_daily_carry, @provenance, @storage_location
      )
    `);
    const result = stmt.run({ is_daily_carry: 0, provenance: "", storage_location: "", ...data });
    const pen = db
      .prepare("SELECT * FROM pens WHERE id = ?")
      .get(result.lastInsertRowid) as Pen;
    return NextResponse.json(pen, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create pen" },
      { status: 500 }
    );
  }
}
