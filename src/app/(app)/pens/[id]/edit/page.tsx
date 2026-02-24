import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Pen } from "@/lib/types";
import PenForm from "@/components/PenForm";

export const dynamic = "force-dynamic";

export default async function EditPenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const { id } = await params;
  const pen = db
    .prepare("SELECT * FROM pens WHERE id = ? AND user_id = ?")
    .get(parseInt(id), userId) as Pen | undefined;

  if (!pen) notFound();

  const tags = (db.prepare("SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag").all(pen.id) as { tag: string }[]).map(t => t.tag);

  return <PenForm initialData={pen} penId={pen.id} initialTags={tags} />;
}
