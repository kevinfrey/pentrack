import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Pen } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  try {
    const pen = db
      .prepare("SELECT * FROM pens WHERE id = ? AND user_id = ?")
      .get(parseInt(id), userId) as Pen | undefined;
    if (!pen) return NextResponse.json({ error: "Pen not found" }, { status: 404 });
    return NextResponse.json(pen);
  } catch {
    return NextResponse.json({ error: "Failed to fetch pen" }, { status: 500 });
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
      UPDATE pens SET
        brand = @brand, model = @model, color = @color,
        nib_size = @nib_size, nib_material = @nib_material, nib_type = @nib_type,
        fill_system = @fill_system, date_purchased = @date_purchased,
        purchase_price = @purchase_price, purchase_location = @purchase_location,
        current_ink = @current_ink, condition = @condition, notes = @notes,
        image_url = @image_url, rating = @rating,
        is_daily_carry = @is_daily_carry, provenance = @provenance,
        storage_location = @storage_location,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id AND user_id = @user_id
    `).run({ is_daily_carry: 0, provenance: "", storage_location: "", ...data, id: parseInt(id), user_id: userId });
    const pen = db
      .prepare("SELECT * FROM pens WHERE id = ? AND user_id = ?")
      .get(parseInt(id), userId) as Pen;
    return NextResponse.json(pen);
  } catch {
    return NextResponse.json({ error: "Failed to update pen" }, { status: 500 });
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
    db.prepare("DELETE FROM pens WHERE id = ? AND user_id = ?").run(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete pen" }, { status: 500 });
  }
}
