import db from "@/lib/db";
import { Pen } from "@/lib/types";
import CollectionGrid from "@/components/CollectionGrid";

export const dynamic = "force-dynamic";

export default function Home() {
  const pens = db
    .prepare("SELECT * FROM pens ORDER BY created_at DESC")
    .all() as Pen[];

  const pensWithTags = pens.map(pen => {
    const tags = (db
      .prepare("SELECT tag FROM pen_tags WHERE pen_id = ? ORDER BY tag")
      .all(pen.id) as { tag: string }[]).map(t => t.tag);
    return { ...pen, tags };
  });

  const totalValue = pens
    .filter((p) => p.purchase_price != null)
    .reduce((sum, p) => sum + (p.purchase_price ?? 0), 0);

  return <CollectionGrid pens={pensWithTags} totalValue={totalValue} />;
}
