"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pen } from "@/lib/types";
import { NibIcon } from "@/components/Logo";
import TagInput from "@/components/TagInput";

const NIB_SIZES = ["EF", "XF", "F", "M", "B", "BB", "1.0mm", "1.1mm", "1.5mm", "2.0mm", "Flex", "Oblique", "Other"];
const NIB_MATERIALS = ["Steel", "Gold (14k)", "Gold (18k)", "Gold (21k)", "Titanium", "Unknown"];
const NIB_TYPES = ["Regular", "Flex", "Italic", "Stub", "Cursive Italic", "Architect", "Reverse", "Zoom", "Other"];
const FILL_SYSTEMS = ["Cartridge/Converter", "Piston", "Eyedropper", "Vacuum", "Squeeze", "Button", "Coin", "Aerometric", "Unknown"];
const CONDITIONS = ["New", "Mint", "Excellent", "Good", "Fair", "Poor", "Restoration Project"];

type FormData = {
  brand: string; model: string; color: string;
  nib_size: string; nib_material: string; nib_type: string; fill_system: string;
  date_purchased: string; purchase_price: string; purchase_location: string;
  current_ink: string; condition: string; notes: string; image_url: string; rating: number;
  is_daily_carry: number; provenance: string; storage_location: string;
};

const EMPTY: FormData = {
  brand: "", model: "", color: "",
  nib_size: "", nib_material: "", nib_type: "", fill_system: "",
  date_purchased: "", purchase_price: "", purchase_location: "",
  current_ink: "", condition: "", notes: "", image_url: "", rating: 0,
  is_daily_carry: 0, provenance: "", storage_location: "",
};

function penToForm(pen?: Pen): FormData {
  if (!pen) return EMPTY;
  return {
    ...pen,
    purchase_price: pen.purchase_price !== null ? String(pen.purchase_price) : "",
    is_daily_carry: pen.is_daily_carry ?? 0,
    provenance: pen.provenance ?? "",
    storage_location: pen.storage_location ?? "",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-playfair font-semibold text-stone-900 text-lg mb-4">{children}</h2>
  );
}

export default function PenForm({ initialData, penId, initialTags }: { initialData?: Pen; penId?: number; initialTags?: string[] }) {
  const router = useRouter();
  const isEdit = penId !== undefined;

  const [form, setForm] = useState<FormData>(penToForm(initialData));
  const [tags, setTags] = useState<string[]>(initialTags ?? []);
  const [imagePreview, setImagePreview] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleIdentify = async () => {
    if (!pendingFile) return;
    setIsIdentifying(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("image", pendingFile);
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        image_url: data.imageUrl || prev.image_url,
        brand: data.brand || prev.brand,
        model: data.model || prev.model,
        color: data.color || prev.color,
        nib_size: data.nib_size || prev.nib_size,
        nib_material: data.nib_material || prev.nib_material,
        nib_type: data.nib_type || prev.nib_type,
        fill_system: data.fill_system || prev.fill_system,
      }));
      setPendingFile(null);
      setMessageType(data.identified ? "success" : "info");
      setMessage(data.identified ? "Pen identified — review and confirm the details below." : data.message || "Image saved.");
    } catch {
      setMessageType("info");
      setMessage("Could not identify pen. Please fill in details manually.");
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSave = async () => {
    if (!form.brand.trim()) { alert("Please enter at least a brand name."); return; }
    setIsSaving(true);
    try {
      let imageUrl = form.image_url;
      if (pendingFile) {
        const fd = new FormData();
        fd.append("image", pendingFile);
        const res = await fetch("/api/identify", { method: "POST", body: fd });
        const data = await res.json();
        imageUrl = data.imageUrl || imageUrl;
      }
      const payload = {
        ...form,
        image_url: imageUrl,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      };
      const res = await fetch(isEdit ? `/api/pens/${penId}` : "/api/pens", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const pen = await res.json();

      // Save tags
      if (isEdit) {
        // Delete all existing tags then re-add
        const existingTagsRes = await fetch(`/api/pens/${pen.id}/tags`);
        const existingTags: string[] = await existingTagsRes.json();
        for (const tag of existingTags) {
          await fetch(`/api/pens/${pen.id}/tags`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag }),
          });
        }
      }
      for (const tag of tags) {
        await fetch(`/api/pens/${pen.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag }),
        });
      }

      router.push(`/pens/${pen.id}`);
      router.refresh();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentImage = imagePreview || form.image_url;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href={isEdit ? `/pens/${penId}` : "/"} className="btn-ghost flex items-center gap-1 text-sm">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isEdit ? "Back" : "Collection"}
        </Link>
        <h1 className="font-playfair text-2xl font-bold text-stone-900">
          {isEdit ? "Edit Pen" : "Add New Pen"}
        </h1>
      </div>

      {/* Photo section */}
      <div className="section-card">
        <SectionHeader>Photo</SectionHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className="w-full sm:w-40 h-52 sm:h-48 bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-stone-300 hover:border-slate-400 transition-colors flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentImage} alt="Pen preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-stone-400 p-4">
                <NibIcon className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">Tap to add photo</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 flex-1 justify-center">
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full">
              📷 Take / Upload Photo
            </button>
            {pendingFile && (
              <button type="button" onClick={handleIdentify} disabled={isIdentifying} className="btn-primary w-full">
                {isIdentifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Identifying…
                  </span>
                ) : "✨ Identify with AI"}
              </button>
            )}
            {message && (
              <p className={`text-xs rounded-xl p-3 leading-relaxed ${
                messageType === "success"
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : "text-stone-600 bg-stone-100 border border-stone-200"
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pen details */}
      <div className="section-card">
        <SectionHeader>Pen Details</SectionHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Brand *">
              <input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Pilot, Lamy, TWSBI" className="field-input" />
            </Field>
            <Field label="Model">
              <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Metropolitan, Safari" className="field-input" />
            </Field>
          </div>
          <Field label="Color">
            <input value={form.color} onChange={e => set("color", e.target.value)} placeholder="e.g. Black, Navy Blue, Clear Demonstrator" className="field-input" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nib Size">
              <select value={form.nib_size} onChange={e => set("nib_size", e.target.value)} className="field-input">
                <option value="">Select…</option>
                {NIB_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Nib Material">
              <select value={form.nib_material} onChange={e => set("nib_material", e.target.value)} className="field-input">
                <option value="">Select…</option>
                {NIB_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Nib Type">
              <select value={form.nib_type} onChange={e => set("nib_type", e.target.value)} className="field-input">
                <option value="">Select…</option>
                {NIB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Fill System">
            <select value={form.fill_system} onChange={e => set("fill_system", e.target.value)} className="field-input">
              <option value="">Select…</option>
              {FILL_SYSTEMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Purchase info */}
      <div className="section-card">
        <SectionHeader>Purchase Info</SectionHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date Purchased">
              <input type="date" value={form.date_purchased} onChange={e => set("date_purchased", e.target.value)} className="field-input" />
            </Field>
            <Field label="Purchase Price ($)">
              <input type="number" value={form.purchase_price} onChange={e => set("purchase_price", e.target.value)} placeholder="0.00" min="0" step="0.01" className="field-input" />
            </Field>
          </div>
          <Field label="Where Purchased">
            <input value={form.purchase_location} onChange={e => set("purchase_location", e.target.value)} placeholder="e.g. JetPens, local pen shop, eBay" className="field-input" />
          </Field>
          <Field label="Provenance / Acquisition Story">
            <textarea value={form.provenance} onChange={e => set("provenance", e.target.value)} placeholder="How did you come to own this pen?" rows={2} className="field-input resize-none" />
          </Field>
        </div>
      </div>

      {/* Status & notes */}
      <div className="section-card">
        <SectionHeader>Status & Notes</SectionHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Current Ink">
              <input value={form.current_ink} onChange={e => set("current_ink", e.target.value)} placeholder="e.g. Pilot Iroshizuku Kon-Peki" className="field-input" />
            </Field>
            <Field label="Condition">
              <select value={form.condition} onChange={e => set("condition", e.target.value)} className="field-input">
                <option value="">Select…</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Storage Location">
            <input value={form.storage_location} onChange={e => set("storage_location", e.target.value)} placeholder="e.g. Top drawer, pen case, display stand" className="field-input" />
          </Field>
          <div>
            <label className="field-label">Daily Carry</label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => set("is_daily_carry", form.is_daily_carry ? 0 : 1)}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_daily_carry ? "bg-amber-400" : "bg-stone-200"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_daily_carry ? "translate-x-5" : "translate-x-1"}`} />
              </div>
              <span className="text-sm text-stone-600">{form.is_daily_carry ? "Yes — this is a daily carry" : "Not a daily carry"}</span>
            </label>
          </div>
          <Field label="Rating">
            <div className="flex gap-1.5 mt-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => set("rating", form.rating === star ? 0 : star)}
                  className={`text-2xl leading-none transition-all ${star <= form.rating ? "text-amber-400 scale-110" : "text-stone-200 hover:text-amber-300"}`}>
                  ★
                </button>
              ))}
            </div>
          </Field>
          <Field label="Tags">
            <TagInput tags={tags} onChange={setTags} />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes about this pen…" rows={3} className="field-input resize-none" />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Link href={isEdit ? `/pens/${penId}` : "/"} className="btn-secondary flex-1 text-center">
          Cancel
        </Link>
        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
          {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Add to Collection"}
        </button>
      </div>
    </div>
  );
}
