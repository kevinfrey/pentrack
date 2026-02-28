"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { InkBottle } from "@/lib/types";
import InkBottleCard from "@/components/InkBottleCard";

const INK_TYPES = ["dye", "pigmented", "shimmer", "sheen", "iron gall", "other"];

export default function InksPage() {
  const [inks, setInks] = useState<InkBottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Read ?search= query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearch(q);
  }, []);

  useEffect(() => {
    fetch("/api/ink-catalog")
      .then(r => r.json())
      .then((data: InkBottle[]) => { setInks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = inks.filter(ink => {
    const q = search.toLowerCase();
    const matchesSearch = !q || ink.name.toLowerCase().includes(q) || ink.brand.toLowerCase().includes(q);
    const matchesType = !typeFilter || ink.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">Ink Catalog</h1>
          <p className="text-stone-500 text-sm mt-2">{inks.length} {inks.length === 1 ? "bottle" : "bottles"}</p>
        </div>
        <Link href="/inks/new" className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          Add Ink
        </Link>
      </div>

      {!loading && inks.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input flex-1"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="field-input sm:w-48"
          >
            <option value="">All Types</option>
            {INK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-stone-400">Loading…</div>
      ) : inks.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-5">
            <span className="text-4xl">🖋️</span>
          </div>
          <h2 className="font-playfair text-xl font-semibold text-stone-700 mb-2">No inks yet</h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">Add your first ink bottle to start tracking your ink collection</p>
          <Link href="/inks/new" className="btn-primary">Add Your First Ink</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">No inks match your search.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ink) => (
            <div key={ink.id} className="relative group/card">
              <InkBottleCard ink={ink} />
              <Link
                href={`/inks/${ink.id}`}
                className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-stone-600 hover:text-stone-900 text-xs font-medium px-2 py-1 rounded-lg shadow-sm ring-1 ring-stone-200"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
