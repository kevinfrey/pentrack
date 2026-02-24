import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    db.prepare("DELETE FROM maintenance_log WHERE id = ?").run(parseInt(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete maintenance entry" }, { status: 500 });
  }
}
