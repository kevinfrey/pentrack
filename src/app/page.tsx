import Link from "next/link";
import db from "@/lib/db";
import { Pen } from "@/lib/types";
import PenCard from "@/components/PenCard";
import { NibIcon } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default function Home() {
  const pens = db
    .prepare("SELECT * FROM pens ORDER BY created_at DESC")
    .all() as Pen[];

  const totalValue = pens
    .filter((p) => p.purchase_price != null)
    .reduce((sum, p) => sum + (p.purchase_price ?? 0), 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">
            My Collection
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-stone-500 text-sm">
              {pens.length} {pens.length === 1 ? "pen" : "pens"}
            </span>
            {totalValue > 0 && (
              <>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500 text-sm">
                  ${totalValue.toFixed(0)} total value
                </span>
              </>
            )}
          </div>
        </div>
        <Link href="/pens/new" className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          Add Pen
        </Link>
      </div>

      {pens.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-5">
            <NibIcon className="h-9 w-9 text-stone-400" />
          </div>
          <h2 className="font-playfair text-xl font-semibold text-stone-700 mb-2">
            Your collection is empty
          </h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
            Add your first pen to start building your collection
          </p>
          <Link href="/pens/new" className="btn-primary">
            Add Your First Pen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pens.map((pen) => (
            <PenCard key={pen.id} pen={pen} />
          ))}
        </div>
      )}
    </div>
  );
}
