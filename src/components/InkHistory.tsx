"use client";

import { useState } from "react";
import { InkEntry } from "@/lib/types";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InkHistory({
  penId,
  initialHistory,
}: {
  penId: number;
  initialHistory: InkEntry[];
}) {
  const [history, setHistory] = useState<InkEntry[]>(initialHistory);
  const [showForm, setShowForm] = useState(false);
  const [inkName, setInkName] = useState("");
  const [inkedDate, setInkedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const current = history[0] ?? null;
  const past = history.slice(1);

  const handleAdd = async () => {
    if (!inkName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pens/${penId}/inks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ink_name: inkName.trim(),
          inked_date: inkedDate,
          notes,
        }),
      });
      if (!res.ok) throw new Error();
      const entry: InkEntry = await res.json();
      setHistory((prev) => [entry, ...prev]);
      setInkName("");
      setNotes("");
      setInkedDate(new Date().toISOString().split("T")[0]);
      setShowForm(false);
    } catch {
      alert("Failed to save ink entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/inks/${id}`, { method: "DELETE" });
      if (res.ok) setHistory((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-playfair font-semibold text-stone-900">Ink</h2>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setInkName("");
            setNotes("");
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            showForm
              ? "text-stone-500 bg-stone-100 hover:bg-stone-200"
              : "text-white bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {showForm ? "Cancel" : "+ Ink Pen"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-amber-50 rounded-xl border border-stone-200 p-4 mb-4 space-y-3">
          <div>
            <label className="field-label">Ink Name *</label>
            <input
              value={inkName}
              onChange={(e) => setInkName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Pilot Iroshizuku Kon-Peki"
              autoFocus
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Date Inked</label>
            <input
              type="date"
              value={inkedDate}
              onChange={(e) => setInkedDate(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Optional notes…"
              className="field-input"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={isSaving || !inkName.trim()}
            className="btn-primary w-full"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      {/* Current ink */}
      {current && !showForm && (
        <div className="bg-amber-50 border border-amber-200/70 rounded-xl px-4 py-3.5 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Currently inked
              </p>
              <p className="font-semibold text-stone-900 truncate">
                {current.ink_name}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {formatDate(current.inked_date)}
              </p>
              {current.notes && (
                <p className="text-xs text-stone-500 mt-1 italic">
                  {current.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(current.id)}
              disabled={deletingId === current.id}
              className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5 disabled:opacity-40 text-sm"
              title="Remove current ink"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* No ink */}
      {history.length === 0 && !showForm && (
        <p className="text-sm text-stone-400 text-center py-3">
          No ink history yet
        </p>
      )}

      {/* Past inks */}
      {past.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
            History
          </p>
          <div>
            {past.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-start justify-between py-2.5 ${
                  i < past.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm text-stone-700 truncate">
                    {entry.ink_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {formatDate(entry.inked_date)}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-stone-400 italic mt-0.5">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="text-stone-200 hover:text-red-400 ml-3 flex-shrink-0 transition-colors disabled:opacity-40 text-xs"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
