import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { WishlistItem } from "@/lib/types";

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
      UPDATE wishlist SET
        brand = @brand, model = @model, notes = @notes, url = @url,
        estimated_price = @estimated_price, priority = @priority, acquired = @acquired
      WHERE id = @id AND user_id = @user_id
    `).run({ ...data, id: parseInt(id), user_id: userId });
    const item = db.prepare("SELECT * FROM wishlist WHERE id = ? AND user_id = ?").get(parseInt(id), userId) as WishlistItem;
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update wishlist item" }, { status: 500 });
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
    db.prepare("DELETE FROM wishlist WHERE id = ? AND user_id = ?").run(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete wishlist item" }, { status: 500 });
  }
}
