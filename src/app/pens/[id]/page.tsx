import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import { Pen, InkEntry } from "@/lib/types";
import DeleteButton from "@/components/DeleteButton";
import InkHistory from "@/components/InkHistory";

export const dynamic = "force-dynamic";

export default async function PenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const penId = parseInt(id);

  const pen = db
    .prepare("SELECT * FROM pens WHERE id = ?")
    .get(penId) as Pen | undefined;

  if (!pen) notFound();

  const inkHistory = db
    .prepare(
      "SELECT * FROM ink_history WHERE pen_id = ? ORDER BY inked_date DESC, created_at DESC"
    )
    .all(penId) as InkEntry[];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Collection
        </Link>
        <Link
          href={`/pens/${pen.id}/edit`}
          className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/80 overflow-hidden mb-5">
        {pen.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pen.image_url}
            alt={`${pen.brand} ${pen.model}`}
            className="w-full object-contain max-h-72 bg-stone-50"
          />
        ) : (
          <div className="h-32 bg-stone-50 flex items-center justify-center">
            <span className="text-stone-200 text-5xl">✒️</span>
          </div>
        )}
        <div className="px-5 py-4 border-t border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900">
                {pen.brand}
              </h1>
              {pen.model && (
                <p className="text-stone-500 mt-0.5">{pen.model}</p>
              )}
            </div>
            {pen.rating > 0 && (
              <div className="text-amber-400 text-lg flex-shrink-0 mt-1">
                {"★".repeat(pen.rating)}
                <span className="text-stone-200">{"★".repeat(5 - pen.rating)}</span>
              </div>
            )}
          </div>

          {/* Key specs row */}
          {(pen.nib_size || pen.fill_system || pen.color) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {pen.nib_size && (
                <Chip label="Nib" value={pen.nib_size} />
              )}
              {pen.fill_system && (
                <Chip label="Fill" value={pen.fill_system} />
              )}
              {pen.color && (
                <Chip label="Color" value={pen.color} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pen specs */}
      <div className="section-card">
        <h2 className="font-playfair font-semibold text-stone-900 mb-3">Specifications</h2>
        <dl className="divide-y divide-stone-100">
          <DetailRow label="Nib Size" value={pen.nib_size} />
          <DetailRow label="Nib Material" value={pen.nib_material} />
          <DetailRow label="Nib Type" value={pen.nib_type} />
          <DetailRow label="Fill System" value={pen.fill_system} />
          <DetailRow label="Color" value={pen.color} />
          <DetailRow label="Condition" value={pen.condition} />
        </dl>
      </div>

      {/* Purchase info */}
      {(pen.date_purchased || pen.purchase_price != null || pen.purchase_location) && (
        <div className="section-card">
          <h2 className="font-playfair font-semibold text-stone-900 mb-3">Purchase</h2>
          <dl className="divide-y divide-stone-100">
            <DetailRow label="Date" value={pen.date_purchased} />
            <DetailRow
              label="Price"
              value={pen.purchase_price != null ? `$${pen.purchase_price.toFixed(2)}` : ""}
            />
            <DetailRow label="From" value={pen.purchase_location} />
          </dl>
        </div>
      )}

      {/* Ink history */}
      <InkHistory penId={pen.id} initialHistory={inkHistory} />

      {/* Notes */}
      {pen.notes && (
        <div className="section-card">
          <h2 className="font-playfair font-semibold text-stone-900 mb-2">Notes</h2>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
            {pen.notes}
          </p>
        </div>
      )}

      <DeleteButton penId={pen.id} />
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg px-2.5 py-1">
      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-medium text-stone-700">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline py-2.5">
      <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wider w-32 flex-shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-stone-800 flex-1">{value}</dd>
    </div>
  );
}
