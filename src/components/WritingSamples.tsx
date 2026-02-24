"use client";

import { useState, useRef } from "react";
import { WritingSample } from "@/lib/types";

interface WritingSamplesProps {
  penId: number;
  initialSamples: WritingSample[];
}

export default function WritingSamples({ penId, initialSamples }: WritingSamplesProps) {
  const [samples, setSamples] = useState<WritingSample[]>(initialSamples);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ ink_name: "", paper: "", notes: "" });
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    setIsSaving(true);
    try {
      let imageUrl = "";
      if (pendingFile) {
        const fd = new FormData();
        fd.append("image", pendingFile);
        const uploadRes = await fetch("/api/identify", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl || "";
      }

      const res = await fetch(`/api/pens/${penId}/writing-samples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image_url: imageUrl }),
      });
      if (!res.ok) throw new Error();
      const sample = await res.json();
      setSamples(prev => [sample, ...prev]);
      setForm({ ink_name: "", paper: "", notes: "" });
      setPendingFile(null);
      setImagePreview("");
      setIsAdding(false);
    } catch {
      alert("Failed to save writing sample.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this writing sample?")) return;
    await fetch(`/api/writing-samples/${id}`, { method: "DELETE" });
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-playfair font-semibold text-stone-900">Writing Samples</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add Sample"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-stone-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="field-label">Ink Used</label>
              <input value={form.ink_name} onChange={e => set("ink_name", e.target.value)} placeholder="e.g. Kon-Peki" className="field-input" />
            </div>
            <div>
              <label className="field-label">Paper</label>
              <input value={form.paper} onChange={e => set("paper", e.target.value)} placeholder="e.g. Rhodia No. 16" className="field-input" />
            </div>
          </div>
          <div>
            <label className="field-label">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="How did it write?" rows={2} className="field-input resize-none" />
          </div>

          {/* Photo upload */}
          <div>
            <label className="field-label">Photo</label>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Writing sample preview" className="w-full max-h-48 object-contain rounded-xl bg-white border border-stone-200" />
                <button
                  onClick={() => { setPendingFile(null); setImagePreview(""); }}
                  className="absolute top-2 right-2 w-6 h-6 bg-stone-800/70 text-white rounded-full text-sm flex items-center justify-center hover:bg-stone-900"
                >
                  ×
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full">
                📷 Upload Photo
              </button>
            )}
          </div>

          <button onClick={handleAdd} disabled={isSaving} className="btn-primary w-full">
            {isSaving ? "Saving…" : "Add Sample"}
          </button>
        </div>
      )}

      {samples.length === 0 ? (
        <p className="text-sm text-stone-400 py-2">No writing samples yet.</p>
      ) : (
        <div className="space-y-4">
          {samples.map(sample => (
            <div key={sample.id} className="border border-stone-100 rounded-xl overflow-hidden">
              {sample.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sample.image_url} alt="Writing sample" className="w-full max-h-48 object-contain bg-stone-50" />
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    {sample.ink_name && (
                      <p className="text-sm font-medium text-stone-800">🖋️ {sample.ink_name}</p>
                    )}
                    {sample.paper && (
                      <p className="text-xs text-stone-500">📄 {sample.paper}</p>
                    )}
                    {sample.notes && (
                      <p className="text-xs text-stone-500 mt-1">{sample.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(sample.id)}
                    className="text-stone-300 hover:text-red-400 text-lg leading-none transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[10px] text-stone-300 mt-1.5">{new Date(sample.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
