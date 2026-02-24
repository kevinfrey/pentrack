import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const totalPens = (db.prepare("SELECT COUNT(*) as count FROM pens WHERE user_id = ?").get(userId) as { count: number }).count;
    const totalValue = (db.prepare("SELECT COALESCE(SUM(purchase_price), 0) as total FROM pens WHERE purchase_price IS NOT NULL AND user_id = ?").get(userId) as { total: number }).total;
    const avgRating = (db.prepare("SELECT COALESCE(AVG(rating), 0) as avg FROM pens WHERE rating > 0 AND user_id = ?").get(userId) as { avg: number }).avg;
    const totalInkBottles = (db.prepare("SELECT COUNT(*) as count FROM ink_bottles WHERE user_id = ?").get(userId) as { count: number }).count;
    const wishlistCount = (db.prepare("SELECT COUNT(*) as count FROM wishlist WHERE acquired = 0 AND user_id = ?").get(userId) as { count: number }).count;

    const byBrand = db.prepare(`
      SELECT brand, COUNT(*) as count FROM pens
      WHERE brand != '' AND user_id = ? GROUP BY brand ORDER BY count DESC LIMIT 10
    `).all(userId) as { brand: string; count: number }[];

    const byNibSize = db.prepare(`
      SELECT nib_size, COUNT(*) as count FROM pens
      WHERE nib_size != '' AND user_id = ? GROUP BY nib_size ORDER BY count DESC
    `).all(userId) as { nib_size: string; count: number }[];

    const mostUsedInks = db.prepare(`
      SELECT ih.ink_name, COUNT(*) as count FROM ink_history ih
      JOIN pens p ON p.id = ih.pen_id
      WHERE ih.ink_name != '' AND p.user_id = ? GROUP BY ih.ink_name ORDER BY count DESC LIMIT 10
    `).all(userId) as { ink_name: string; count: number }[];

    const mostActivePens = db.prepare(`
      SELECT p.brand, p.model, p.id, COUNT(ih.id) as ink_changes
      FROM pens p
      LEFT JOIN ink_history ih ON p.id = ih.pen_id
      WHERE p.user_id = ?
      GROUP BY p.id ORDER BY ink_changes DESC LIMIT 5
    `).all(userId) as { brand: string; model: string; id: number; ink_changes: number }[];

    const lowStockInks = db.prepare(`
      SELECT * FROM ink_bottles WHERE remaining_pct <= 25 AND user_id = ? ORDER BY remaining_pct ASC
    `).all(userId);

    return NextResponse.json({
      totalPens, totalValue, avgRating, totalInkBottles, wishlistCount,
      byBrand, byNibSize, mostUsedInks, mostActivePens, lowStockInks,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
