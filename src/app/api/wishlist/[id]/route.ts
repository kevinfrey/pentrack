import { NextResponse } from "next/server";
import db from "@/lib/db";
import { WishlistItem } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();
    db.prepare(`
      UPDATE wishlist SET
        brand = @brand, model = @model, notes = @notes, url = @url,
        estimated_price = @estimated_price, priority = @priority, acquired = @acquired
      WHERE id = @id
    `).run({ ...data, id: parseInt(id) });
    const item = db.prepare("SELECT * FROM wishlist WHERE id = ?").get(parseInt(id)) as WishlistItem;
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update wishlist item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    db.prepare("DELETE FROM wishlist WHERE id = ?").run(parseInt(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete wishlist item" }, { status: 500 });
  }
}
