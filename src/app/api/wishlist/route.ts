import { NextResponse } from "next/server";
import db from "@/lib/db";
import { WishlistItem } from "@/lib/types";

export async function GET() {
  try {
    const items = db
      .prepare("SELECT * FROM wishlist ORDER BY created_at DESC")
      .all() as WishlistItem[];
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = db.prepare(`
      INSERT INTO wishlist (brand, model, notes, url, estimated_price, priority, acquired)
      VALUES (@brand, @model, @notes, @url, @estimated_price, @priority, @acquired)
    `).run({ acquired: 0, ...data });
    const item = db.prepare("SELECT * FROM wishlist WHERE id = ?").get(result.lastInsertRowid) as WishlistItem;
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create wishlist item" }, { status: 500 });
  }
}
