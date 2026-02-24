import Link from "next/link";
import { Pen } from "@/lib/types";
import { NibIcon } from "@/components/Logo";

export default function PenCard({ pen }: { pen: Pen }) {
  return (
    <Link
      href={`/pens/${pen.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-stone-200/80 hover:shadow-lg hover:ring-stone-300/80 transition-all duration-200"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
        {pen.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pen.image_url}
            alt={`${pen.brand} ${pen.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <NibIcon className="h-10 w-10 text-stone-300 group-hover:text-stone-400 transition-colors" />
          </div>
        )}

        {/* Nib size badge */}
        {pen.nib_size && (
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg tracking-wide">
            {pen.nib_size}
          </div>
        )}

        {/* Current ink dot */}
        {pen.current_ink && (
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white shadow-sm" title={`Inked: ${pen.current_ink}`} />
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="font-semibold text-stone-900 text-sm truncate">
          {pen.brand || "Unknown Brand"}
        </p>
        <p className="text-xs text-stone-400 truncate mt-0.5">
          {pen.model || "—"}
        </p>

        {pen.rating > 0 && (
          <div className="mt-2 text-amber-400 text-xs tracking-tight">
            {"★".repeat(pen.rating)}
            <span className="text-stone-200">{"★".repeat(5 - pen.rating)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
