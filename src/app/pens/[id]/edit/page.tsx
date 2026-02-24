import { notFound } from "next/navigation";
import db from "@/lib/db";
import { Pen } from "@/lib/types";
import PenForm from "@/components/PenForm";

export const dynamic = "force-dynamic";

export default async function EditPenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pen = db
    .prepare("SELECT * FROM pens WHERE id = ?")
    .get(parseInt(id)) as Pen | undefined;

  if (!pen) notFound();

  return <PenForm initialData={pen} penId={pen.id} />;
}
