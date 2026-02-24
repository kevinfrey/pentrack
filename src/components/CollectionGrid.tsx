"use client";

import { useState } from "react";
import { Pen } from "@/lib/types";
import PenCard from "@/components/PenCard";
import { NibIcon } from "@/components/Logo";
import Link from "next/link";

interface PenWithTags extends Pen {
  tags: string[];
}

interface CollectionGridProps {
  pens: PenWithTags[];
  totalValue: number;
}

export default function CollectionGrid({ pens, totalValue }: CollectionGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [dailyCarryOnly, setDailyCarryOnly] = useState(false);

  const allTags = Array.from(new Set(pens.flatMap(p => p.tags))).sort();

  const filtered = pens.filter(pen => {
    if (dailyCarryOnly && !pen.is_daily_carry) return false;
    if (activeTag && !pen.tags.includes(activeTag)) return false;
    return true;
  });

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
  };

  const handleExport = () => {
    window.location.href = "/api/export";
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">
            My Collection
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-stone-500 text-sm">
              {pens.length} {pens.length === 1 ? "pen" : "pens"}
            </span>
            {totalValue > 0 && (
              <>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500 text-sm">
                  ${totalValue.toFixed(0)} total value
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pens.length > 0 && (
            <button
              onClick={handleExport}
              className="btn-ghost text-sm"
              title="Export collection as CSV"
            >
              ↓ CSV
            </button>
          )}
          <Link href="/pens/new" className="btn-primary flex items-center gap-2">
            <span className="text-lg leading-none">+</span>
            Add Pen
          </Link>
        </div>
      </div>

      {pens.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-5">
            <NibIcon className="h-9 w-9 text-stone-400" />
          </div>
          <h2 className="font-playfair text-xl font-semibold text-stone-700 mb-2">
            Your collection is empty
          </h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
            Add your first pen to start building your collection
          </p>
          <Link href="/pens/new" className="btn-primary">
            Add Your First Pen
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          {(allTags.length > 0 || pens.some(p => p.is_daily_carry)) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {pens.some(p => p.is_daily_carry) && (
                <button
                  onClick={() => setDailyCarryOnly(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    dailyCarryOnly
                      ? "bg-amber-400 text-amber-950 border-amber-400"
                      : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"
                  }`}
                >
                  EDC only
                </button>
              )}
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    activeTag === tag
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-stone-600 border-stone-200 hover:border-slate-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {(activeTag || dailyCarryOnly) && (
                <button
                  onClick={() => { setActiveTag(null); setDailyCarryOnly(false); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-center py-16 text-stone-400 text-sm">No pens match the current filter.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((pen) => (
                <PenCard
                  key={pen.id}
                  pen={pen}
                  tags={pen.tags}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
