import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const totalPens = (db.prepare("SELECT COUNT(*) as count FROM pens WHERE user_id = ?").get(userId) as { count: number }).count;
  const totalValue = (db.prepare("SELECT COALESCE(SUM(purchase_price), 0) as total FROM pens WHERE purchase_price IS NOT NULL AND user_id = ?").get(userId) as { total: number }).total;
  const avgRating = (db.prepare("SELECT COALESCE(AVG(CAST(rating AS REAL)), 0) as avg FROM pens WHERE rating > 0 AND user_id = ?").get(userId) as { avg: number }).avg;
  const totalInkBottles = (db.prepare("SELECT COUNT(*) as count FROM ink_bottles WHERE user_id = ?").get(userId) as { count: number }).count;
  const wishlistCount = (db.prepare("SELECT COUNT(*) as count FROM wishlist WHERE acquired = 0 AND user_id = ?").get(userId) as { count: number }).count;

  const byBrand = db.prepare(`
    SELECT brand, COUNT(*) as count FROM pens
    WHERE brand != '' AND user_id = ? GROUP BY brand ORDER BY count DESC LIMIT 10
  `).all(userId) as { brand: string; count: number }[];

  const byNibSize = db.prepare(`
    SELECT nib_size, COUNT(*) as count FROM pens
    WHERE nib_size != '' AND user_id = ? GROUP BY nib_size ORDER BY count DESC
  `).all(userId) as { nib_size: string; count: number }[];

  const mostUsedInks = db.prepare(`
    SELECT ih.ink_name, COUNT(*) as count FROM ink_history ih
    JOIN pens p ON p.id = ih.pen_id
    WHERE ih.ink_name != '' AND p.user_id = ? GROUP BY ih.ink_name ORDER BY count DESC LIMIT 10
  `).all(userId) as { ink_name: string; count: number }[];

  const mostActivePens = db.prepare(`
    SELECT p.brand, p.model, p.id, COUNT(ih.id) as ink_changes
    FROM pens p
    LEFT JOIN ink_history ih ON p.id = ih.pen_id
    WHERE p.user_id = ?
    GROUP BY p.id ORDER BY ink_changes DESC LIMIT 5
  `).all(userId) as { brand: string; model: string; id: number; ink_changes: number }[];

  const lowStockInks = db.prepare(`
    SELECT * FROM ink_bottles WHERE remaining_pct <= 25 AND user_id = ? ORDER BY remaining_pct ASC
  `).all(userId) as { id: number; name: string; brand: string; remaining_pct: number }[];

  const brandMax = byBrand[0]?.count || 1;
  const nibMax = byNibSize[0]?.count || 1;
  const inkMax = mostUsedInks[0]?.count || 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">Stats</h1>
        <p className="text-stone-500 text-sm mt-2">Collection insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Pens" value={String(totalPens)} />
        <StatCard label="Total Value" value={totalValue > 0 ? `$${totalValue.toFixed(0)}` : "—"} />
        <StatCard label="Avg Rating" value={avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "—"} />
        <StatCard label="Ink Bottles" value={String(totalInkBottles)} />
        <StatCard label="Wishlist" value={String(wishlistCount)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {byBrand.length > 0 && (
          <div className="section-card">
            <h2 className="font-playfair font-semibold text-stone-900 mb-4">Pens by Brand</h2>
            <div className="space-y-2.5">
              {byBrand.map(({ brand, count }) => (
                <div key={brand}>
                  <div className="flex justify-between text-sm mb-1">
                    <Link
                      href={`/collection?brand=${encodeURIComponent(brand)}`}
                      className="text-stone-700 font-medium truncate hover:text-amber-700 hover:underline transition-colors"
                    >
                      {brand}
                    </Link>
                    <span className="text-stone-400 flex-shrink-0 ml-2">{count}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded-full"
                      style={{ width: `${(count / brandMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {byNibSize.length > 0 && (
          <div className="section-card">
            <h2 className="font-playfair font-semibold text-stone-900 mb-4">Nib Size Distribution</h2>
            <div className="space-y-2.5">
              {byNibSize.map(({ nib_size, count }) => (
                <div key={nib_size}>
                  <div className="flex justify-between text-sm mb-1">
                    <Link
                      href={`/collection?nib=${encodeURIComponent(nib_size)}`}
                      className="text-stone-700 font-medium hover:text-amber-700 hover:underline transition-colors"
                    >
                      {nib_size}
                    </Link>
                    <span className="text-stone-400">{count}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(count / nibMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {mostUsedInks.length > 0 && (
          <div className="section-card">
            <h2 className="font-playfair font-semibold text-stone-900 mb-4">Most Used Inks</h2>
            <div className="space-y-2.5">
              {mostUsedInks.map(({ ink_name, count }) => (
                <div key={ink_name}>
                  <div className="flex justify-between text-sm mb-1">
                    <Link
                      href={`/inks?search=${encodeURIComponent(ink_name)}`}
                      className="text-stone-700 font-medium truncate hover:text-amber-700 hover:underline transition-colors"
                    >
                      {ink_name}
                    </Link>
                    <span className="text-stone-400 flex-shrink-0 ml-2">{count}×</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(count / inkMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {mostActivePens.length > 0 && mostActivePens[0].ink_changes > 0 && (
            <div className="section-card">
              <h2 className="font-playfair font-semibold text-stone-900 mb-4">Most Active Pens</h2>
              <div className="space-y-2">
                {mostActivePens.filter(p => p.ink_changes > 0).map((pen) => (
                  <div key={pen.id} className="flex justify-between text-sm">
                    <Link
                      href={`/pens/${pen.id}`}
                      className="text-stone-700 truncate hover:text-amber-700 hover:underline transition-colors"
                    >
                      {pen.brand} {pen.model && `— ${pen.model}`}
                    </Link>
                    <span className="text-stone-400 flex-shrink-0 ml-2">{pen.ink_changes} inks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStockInks.length > 0 && (
            <div className="section-card border-l-4 border-amber-400">
              <h2 className="font-playfair font-semibold text-stone-900 mb-3">Low Stock Inks</h2>
              <div className="space-y-2">
                {lowStockInks.map((ink) => (
                  <div key={ink.id} className="flex justify-between text-sm">
                    <Link
                      href={`/inks/${ink.id}`}
                      className="text-stone-700 hover:text-amber-700 hover:underline transition-colors"
                    >
                      {ink.brand} — {ink.name}
                    </Link>
                    <span className={`font-medium flex-shrink-0 ml-2 ${ink.remaining_pct <= 10 ? "text-red-500" : "text-amber-600"}`}>
                      {ink.remaining_pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {totalPens === 0 && (
        <div className="text-center py-24 text-stone-400">
          <p>Add some pens to see your stats.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="section-card text-center py-5">
      <p className="font-playfair text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
