"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { WishlistItem } from "@/lib/types";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "grail", label: "✨ Grail" },
];

export default function EditWishlistPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    brand: "", model: "", notes: "", url: "",
    estimated_price: "", priority: "medium", acquired: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/wishlist/${id}`)
      .then(async (res) => {
        if (!res.ok) { setNotFound(true); return; }
        const item: WishlistItem = await res.json();
        setForm({
          brand: item.brand ?? "",
          model: item.model ?? "",
          notes: item.notes ?? "",
          url: item.url ?? "",
          estimated_price: item.estimated_price != null ? String(item.estimated_price) : "",
          priority: item.priority ?? "medium",
          acquired: Boolean(item.acquired),
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.brand.trim()) { alert("Please enter at least a brand name."); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
          notes: form.notes,
          url: form.url,
          estimated_price: form.estimated_price ? parseFloat(form.estimated_price) : null,
          priority: form.priority,
          acquired: form.acquired ? 1 : 0,
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/wishlist");
      router.refresh();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="max-w-2xl mx-auto text-stone-400 text-sm py-12 text-center">Loading…</div>;

  if (notFound) return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <p className="text-stone-500 mb-4">Wishlist item not found.</p>
      <Link href="/wishlist" className="btn-secondary">Back to Wishlist</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/wishlist" className="btn-ghost flex items-center gap-1 text-sm">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Wishlist
        </Link>
        <h1 className="font-playfair text-2xl font-bold text-stone-900">Edit Wishlist Item</h1>
      </div>

      <div className="section-card space-y-4 mb-4">
        <h2 className="font-playfair font-semibold text-stone-900 text-lg">Item Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Brand *</label>
            <input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Pilot, TWSBI" className="field-input" />
          </div>
          <div>
            <label className="field-label">Model</label>
            <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Custom 74" className="field-input" />
          </div>
        </div>

        <div>
          <label className="field-label">Priority</label>
          <div className="flex gap-2 flex-wrap">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => set("priority", p.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.priority === p.value
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Estimated Price ($)</label>
            <input type="number" value={form.estimated_price} onChange={e => set("estimated_price", e.target.value)} placeholder="0.00" min="0" step="0.01" className="field-input" />
          </div>
          <div>
            <label className="field-label">Link / URL</label>
            <input type="url" value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://…" className="field-input" />
          </div>
        </div>

        <div>
          <label className="field-label">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Why you want it, color preference, etc." rows={3} className="field-input resize-none" />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => set("acquired", !form.acquired)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              form.acquired ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300 hover:border-stone-500"
            }`}
          >
            {form.acquired && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="text-sm text-stone-700 font-medium">Mark as acquired</span>
        </div>
      </div>

      <div className="flex gap-3 pb-8">
        <Link href="/wishlist" className="btn-secondary flex-1 text-center">Cancel</Link>
        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
