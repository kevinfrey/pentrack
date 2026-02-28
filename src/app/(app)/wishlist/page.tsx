"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WishlistItem } from "@/lib/types";

const PRIORITY_ORDER = ["grail", "high", "medium", "low"] as const;

const PRIORITY_LABELS: Record<string, string> = {
  grail: "✨ Grail",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

const PRIORITY_STYLES: Record<string, string> = {
  grail: "bg-amber-50 border-amber-200 text-amber-800",
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-blue-50 border-blue-200 text-blue-700",
  low: "bg-stone-50 border-stone-200 text-stone-600",
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [showAcquired, setShowAcquired] = useState(false);

  useEffect(() => {
    fetch("/api/wishlist")
      .then(r => r.json())
      .then(setItems);
  }, []);

  const active = items.filter(i => !i.acquired);
  const acquired = items.filter(i => i.acquired);

  const markAcquired = async (item: WishlistItem) => {
    const res = await fetch(`/api/wishlist/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, acquired: item.acquired ? 0 : 1 }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Remove from wishlist?")) return;
    await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const grouped = PRIORITY_ORDER.reduce<Record<string, WishlistItem[]>>((acc, p) => {
    acc[p] = active.filter(i => i.priority === p);
    return acc;
  }, {} as Record<string, WishlistItem[]>);

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">Wishlist</h1>
          <p className="text-stone-500 text-sm mt-2">{active.length} {active.length === 1 ? "item" : "items"} wanted</p>
        </div>
        <Link href="/wishlist/new" className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          Add Item
        </Link>
      </div>

      {active.length === 0 && acquired.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-5">
            <span className="text-4xl">⭐</span>
          </div>
          <h2 className="font-playfair text-xl font-semibold text-stone-700 mb-2">Wishlist is empty</h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">Add pens and inks you want to acquire</p>
          <Link href="/wishlist/new" className="btn-primary">Add First Item</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {PRIORITY_ORDER.map((priority) => {
            const group = grouped[priority];
            if (group.length === 0) return null;
            return (
              <div key={priority}>
                <h2 className="font-playfair font-semibold text-stone-700 text-lg mb-3">
                  {PRIORITY_LABELS[priority]}
                  <span className="ml-2 text-sm font-normal text-stone-400">({group.length})</span>
                </h2>
                <div className="space-y-3">
                  {group.map(item => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      onAcquired={markAcquired}
                      onDelete={deleteItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {acquired.length > 0 && (
            <div>
              <button
                onClick={() => setShowAcquired(!showAcquired)}
                className="text-sm text-stone-400 hover:text-stone-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 transition-transform ${showAcquired ? "rotate-90" : ""}`} stroke="currentColor" strokeWidth="2">
                  <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {acquired.length} acquired
              </button>
              {showAcquired && (
                <div className="space-y-3 mt-3">
                  {acquired.map(item => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      onAcquired={markAcquired}
                      onDelete={deleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WishlistCard({
  item,
  onAcquired,
  onDelete,
}: {
  item: WishlistItem;
  onAcquired: (item: WishlistItem) => void;
  onDelete: (id: number) => void;
}) {
  const priorityStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;

  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-4 ${item.acquired ? "opacity-60" : ""} ${priorityStyle}`}>
      <button
        onClick={() => onAcquired(item)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
          item.acquired
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-current hover:border-stone-500"
        }`}
        title={item.acquired ? "Mark as wanted" : "Mark as acquired"}
      >
        {item.acquired && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{item.brand}</span>
          {item.model && <span className="text-sm opacity-75">{item.model}</span>}
        </div>
        {item.notes && <p className="text-xs opacity-70 mt-0.5 line-clamp-2">{item.notes}</p>}
        <div className="flex items-center gap-3 mt-1.5">
          {item.estimated_price != null && (
            <span className="text-xs opacity-60">~${item.estimated_price}</span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs underline opacity-60 hover:opacity-100"
            >
              Link
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/wishlist/${item.id}`}
          onClick={e => e.stopPropagation()}
          className="opacity-40 hover:opacity-70 transition-opacity"
          title="Edit"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
            <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <button
          onClick={() => onDelete(item.id)}
          className="text-xs opacity-40 hover:opacity-70 transition-opacity"
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}
