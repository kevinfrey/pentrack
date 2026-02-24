import { NextResponse } from "next/server";
import db from "@/lib/db";
import { Pen } from "@/lib/types";

export async function GET() {
  try {
    const pens = db.prepare("SELECT * FROM pens ORDER BY brand, model").all() as Pen[];

    const headers = [
      "id", "brand", "model", "color", "nib_size", "nib_material", "nib_type",
      "fill_system", "date_purchased", "purchase_price", "purchase_location",
      "current_ink", "condition", "rating", "is_daily_carry", "provenance",
      "storage_location", "notes", "created_at",
    ];

    const escape = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = pens.map((pen) =>
      headers.map((h) => escape((pen as unknown as Record<string, unknown>)[h] as string | number | null)).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="pentrack-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
