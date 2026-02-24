import Link from "next/link";
import db from "@/lib/db";
import { InkBottle } from "@/lib/types";
import InkBottleCard from "@/components/InkBottleCard";

export const dynamic = "force-dynamic";

export default function InksPage() {
  const inks = db.prepare("SELECT * FROM ink_bottles ORDER BY brand, name").all() as InkBottle[];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">
            Ink Catalog
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            {inks.length} {inks.length === 1 ? "bottle" : "bottles"}
          </p>
        </div>
        <Link href="/inks/new" className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          Add Ink
        </Link>
      </div>

      {inks.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-5">
            <span className="text-4xl">🖋️</span>
          </div>
          <h2 className="font-playfair text-xl font-semibold text-stone-700 mb-2">
            No inks yet
          </h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
            Add your first ink bottle to start tracking your ink collection
          </p>
          <Link href="/inks/new" className="btn-primary">
            Add Your First Ink
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {inks.map((ink) => (
            <InkBottleCard key={ink.id} ink={ink} />
          ))}
        </div>
      )}
    </div>
  );
}
