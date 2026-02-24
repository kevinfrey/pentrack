import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { WishlistItem } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const items = db
      .prepare("SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as WishlistItem[];
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const data = await request.json();
    const result = db.prepare(`
      INSERT INTO wishlist (brand, model, notes, url, estimated_price, priority, acquired, user_id)
      VALUES (@brand, @model, @notes, @url, @estimated_price, @priority, @acquired, @user_id)
    `).run({ acquired: 0, ...data, user_id: userId });
    const item = db.prepare("SELECT * FROM wishlist WHERE id = ?").get(result.lastInsertRowid) as WishlistItem;
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create wishlist item" }, { status: 500 });
  }
}
