import Link from "next/link";
import { InkBottle } from "@/lib/types";

function remainingColor(pct: number) {
  if (pct > 50) return "bg-emerald-400";
  if (pct > 25) return "bg-amber-400";
  return "bg-red-400";
}

export default function InkBottleCard({ ink }: { ink: InkBottle }) {
  return (
    <Link
      href={`/inks/${ink.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-stone-200/80 hover:shadow-lg hover:ring-stone-300/80 transition-all duration-200 flex flex-col"
    >
      {/* Color swatch */}
      <div className="h-24 bg-stone-100 relative overflow-hidden flex items-center justify-center">
        {ink.swatch_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ink.swatch_url}
            alt={ink.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-3xl">🖋️</div>
        )}
        {/* Type badge */}
        {ink.type && (
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg tracking-wide">
            {ink.type}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-semibold text-stone-900 text-sm truncate">{ink.name}</p>
          <p className="text-xs text-stone-400 truncate mt-0.5">{ink.brand}</p>
        </div>

        {/* Remaining level */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Remaining</span>
            <span className="text-xs font-medium text-stone-600">{ink.remaining_pct}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${remainingColor(ink.remaining_pct)}`}
              style={{ width: `${ink.remaining_pct}%` }}
            />
          </div>
        </div>

        {ink.color_description && (
          <p className="text-xs text-stone-500 truncate">{ink.color_description}</p>
        )}
      </div>
    </Link>
  );
}
