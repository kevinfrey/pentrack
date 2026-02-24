"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INK_TYPES = ["Dye-based", "Pigmented", "Iron Gall", "Bulletproof", "Shimmer", "Sheen", "Other"];

export default function NewInkPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", brand: "", color_description: "", type: "",
    bottle_size_ml: "", remaining_pct: "100", notes: "", swatch_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim()) {
      alert("Please enter at least a name and brand.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/ink-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bottle_size_ml: form.bottle_size_ml ? parseFloat(form.bottle_size_ml) : null,
          remaining_pct: parseInt(form.remaining_pct) || 100,
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/inks");
      router.refresh();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/inks" className="btn-ghost flex items-center gap-1 text-sm">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ink Catalog
        </Link>
        <h1 className="font-playfair text-2xl font-bold text-stone-900">Add New Ink</h1>
      </div>

      <div className="section-card space-y-4">
        <h2 className="font-playfair font-semibold text-stone-900 text-lg mb-4">Ink Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Kon-Peki" className="field-input" />
          </div>
          <div>
            <label className="field-label">Brand *</label>
            <input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Pilot Iroshizuku" className="field-input" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Color Description</label>
            <input value={form.color_description} onChange={e => set("color_description", e.target.value)} placeholder="e.g. Deep teal blue" className="field-input" />
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
            <input type="number" value={form.bottle_size_ml} onChange={e => set("bottle_size_ml", e.target.value)} placeholder="50" min="0" step="1" className="field-input" />
          </div>
          <div>
            <label className="field-label">Remaining (%)</label>
            <input type="number" value={form.remaining_pct} onChange={e => set("remaining_pct", e.target.value)} placeholder="100" min="0" max="100" className="field-input" />
          </div>
        </div>

        <div>
          <label className="field-label">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any notes about this ink…" rows={3} className="field-input resize-none" />
        </div>
      </div>

      <div className="flex gap-3 pb-8">
        <Link href="/inks" className="btn-secondary flex-1 text-center">Cancel</Link>
        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
          {isSaving ? "Saving…" : "Add to Catalog"}
        </button>
      </div>
    </div>
  );
}
