import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tags = db.prepare(
    "SELECT DISTINCT tag FROM pen_tags pt JOIN pens p ON pt.pen_id = p.id WHERE p.user_id = ? ORDER BY tag"
  ).all(session.user.id) as { tag: string }[];

  return NextResponse.json(tags.map(t => t.tag));
}
