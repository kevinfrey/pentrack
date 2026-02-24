"use client";

import { useState } from "react";
import { MaintenanceEntry } from "@/lib/types";

const MAINTENANCE_TYPES = [
  "Cleaning", "Nib adjustment", "Nib swap", "Repair", "Servicing", "Inspection", "Other"
];

interface MaintenanceLogProps {
  penId: number;
  initialEntries: MaintenanceEntry[];
}

export default function MaintenanceLog({ penId, initialEntries }: MaintenanceLogProps) {
  const [entries, setEntries] = useState<MaintenanceEntry[]>(initialEntries);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ type: "", notes: "", date: new Date().toISOString().slice(0, 10) });
  const [isSaving, setIsSaving] = useState(false);

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleAdd = async () => {
    if (!form.date) { alert("Please enter a date."); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pens/${penId}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const entry = await res.json();
      setEntries(prev => [entry, ...prev]);
      setForm({ type: "", notes: "", date: new Date().toISOString().slice(0, 10) });
      setIsAdding(false);
    } catch {
      alert("Failed to save entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this maintenance entry?")) return;
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-playfair font-semibold text-stone-900">Maintenance Log</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add Entry"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-stone-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="field-label">Type</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className="field-input">
                <option value="">Select…</option>
                {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Date</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="field-input" />
            </div>
          </div>
          <div>
            <label className="field-label">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="What was done?" rows={2} className="field-input resize-none" />
          </div>
          <button onClick={handleAdd} disabled={isSaving} className="btn-primary w-full">
            {isSaving ? "Saving…" : "Log Entry"}
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-stone-400 py-2">No maintenance entries yet.</p>
      ) : (
        <div className="divide-y divide-stone-100">
          {entries.map(entry => (
            <div key={entry.id} className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  {entry.type && (
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{entry.type}</span>
                  )}
                  <span className="text-xs text-stone-400">{entry.date}</span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">{entry.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-stone-300 hover:text-red-400 text-lg leading-none transition-colors flex-shrink-0"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
