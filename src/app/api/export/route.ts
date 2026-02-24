import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Pen } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const pens = db.prepare("SELECT * FROM pens WHERE user_id = ? ORDER BY brand, model").all(userId) as Pen[];

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
        "Content-Disposition": `attachment; filename="penventory-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
