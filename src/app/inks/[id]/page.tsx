"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { InkBottle } from "@/lib/types";

const INK_TYPES = ["Dye-based", "Pigmented", "Iron Gall", "Bulletproof", "Shimmer", "Sheen", "Other"];

function remainingColor(pct: number) {
  if (pct > 50) return "bg-emerald-400";
  if (pct > 25) return "bg-amber-400";
  return "bg-red-400";
}

export default function InkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ink, setInk] = useState<InkBottle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "", brand: "", color_description: "", type: "",
    bottle_size_ml: "", remaining_pct: "100", notes: "", swatch_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/ink-catalog/${id}`)
      .then(r => r.json())
      .then((data: InkBottle) => {
        setInk(data);
        setForm({
          name: data.name,
          brand: data.brand,
          color_description: data.color_description || "",
          type: data.type || "",
          bottle_size_ml: data.bottle_size_ml != null ? String(data.bottle_size_ml) : "",
          remaining_pct: String(data.remaining_pct),
          notes: data.notes || "",
          swatch_url: data.swatch_url || "",
        });
      });
  }, [id]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/ink-catalog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bottle_size_ml: form.bottle_size_ml ? parseFloat(form.bottle_size_ml) : null,
          remaining_pct: parseInt(form.remaining_pct) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setInk(updated);
      setIsEditing(false);
    } catch {
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ink bottle?")) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/ink-catalog/${id}`, { method: "DELETE" });
      router.push("/inks");
      router.refresh();
    } catch {
      alert("Failed to delete.");
      setIsDeleting(false);
    }
  };

  if (!ink) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-24 text-stone-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/inks" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ink Catalog
        </Link>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!isEditing ? (
        <>
          {/* Detail view */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/80 overflow-hidden mb-5">
            {ink.swatch_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ink.swatch_url} alt={ink.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="h-24 bg-stone-50 flex items-center justify-center">
                <span className="text-4xl">🖋️</span>
              </div>
            )}
            <div className="px-5 py-4 border-t border-stone-100">
              <h1 className="font-playfair text-2xl font-bold text-stone-900">{ink.name}</h1>
              <p className="text-stone-500 mt-0.5">{ink.brand}</p>
              {ink.color_description && (
                <p className="text-stone-400 text-sm mt-1">{ink.color_description}</p>
              )}
              {/* Remaining bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Remaining</span>
                  <span className="text-sm font-medium text-stone-700">{ink.remaining_pct}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${remainingColor(ink.remaining_pct)}`}
                    style={{ width: `${ink.remaining_pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2 className="font-playfair font-semibold text-stone-900 mb-3">Details</h2>
            <dl className="divide-y divide-stone-100">
              {ink.type && <Row label="Type" value={ink.type} />}
              {ink.bottle_size_ml && <Row label="Bottle Size" value={`${ink.bottle_size_ml} ml`} />}
            </dl>
            {ink.notes && (
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed mt-3 pt-3 border-t border-stone-100">
                {ink.notes}
              </p>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            {isDeleting ? "Deleting…" : "Delete Ink Bottle"}
          </button>
        </>
      ) : (
        <>
          {/* Edit form */}
          <div className="section-card space-y-4">
            <h2 className="font-playfair font-semibold text-stone-900 text-lg mb-4">Edit Ink</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} className="field-input" />
              </div>
              <div>
                <label className="field-label">Brand *</label>
                <input value={form.brand} onChange={e => set("brand", e.target.value)} className="field-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Color Description</label>
                <input value={form.color_description} onChange={e => set("color_description", e.target.value)} className="field-input" />
              </div>
              <div>
                <label className="field-label">Type</label>
                <select value={form.type} onChange={e => set("type", e.target.value)} className="field-input">
                  <option value="">Select…</option>
                  {INK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Bottle Size (ml)</label>
                <input type="number" value={form.bottle_size_ml} onChange={e => set("bottle_size_ml", e.target.value)} min="0" className="field-input" />
              </div>
              <div>
                <label className="field-label">Remaining (%)</label>
                <input type="number" value={form.remaining_pct} onChange={e => set("remaining_pct", e.target.value)} min="0" max="100" className="field-input" />
              </div>
            </div>

            <div>
              <label className="field-label">Notes</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} className="field-input resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline py-2.5">
      <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wider w-32 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-stone-800 flex-1">{value}</dd>
    </div>
  );
}
