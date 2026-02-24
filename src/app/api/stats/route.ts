import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const totalPens = (db.prepare("SELECT COUNT(*) as count FROM pens").get() as { count: number }).count;
    const totalValue = (db.prepare("SELECT COALESCE(SUM(purchase_price), 0) as total FROM pens WHERE purchase_price IS NOT NULL").get() as { total: number }).total;
    const avgRating = (db.prepare("SELECT COALESCE(AVG(rating), 0) as avg FROM pens WHERE rating > 0").get() as { avg: number }).avg;
    const totalInkBottles = (db.prepare("SELECT COUNT(*) as count FROM ink_bottles").get() as { count: number }).count;
    const wishlistCount = (db.prepare("SELECT COUNT(*) as count FROM wishlist WHERE acquired = 0").get() as { count: number }).count;

    const byBrand = db.prepare(`
      SELECT brand, COUNT(*) as count FROM pens
      WHERE brand != '' GROUP BY brand ORDER BY count DESC LIMIT 10
    `).all() as { brand: string; count: number }[];

    const byNibSize = db.prepare(`
      SELECT nib_size, COUNT(*) as count FROM pens
      WHERE nib_size != '' GROUP BY nib_size ORDER BY count DESC
    `).all() as { nib_size: string; count: number }[];

    const mostUsedInks = db.prepare(`
      SELECT ink_name, COUNT(*) as count FROM ink_history
      WHERE ink_name != '' GROUP BY ink_name ORDER BY count DESC LIMIT 10
    `).all() as { ink_name: string; count: number }[];

    const mostActivePens = db.prepare(`
      SELECT p.brand, p.model, p.id, COUNT(ih.id) as ink_changes
      FROM pens p
      LEFT JOIN ink_history ih ON p.id = ih.pen_id
      GROUP BY p.id ORDER BY ink_changes DESC LIMIT 5
    `).all() as { brand: string; model: string; id: number; ink_changes: number }[];

    const lowStockInks = db.prepare(`
      SELECT * FROM ink_bottles WHERE remaining_pct <= 25 ORDER BY remaining_pct ASC
    `).all();

    return NextResponse.json({
      totalPens,
      totalValue,
      avgRating,
      totalInkBottles,
      wishlistCount,
      byBrand,
      byNibSize,
      mostUsedInks,
      mostActivePens,
      lowStockInks,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
