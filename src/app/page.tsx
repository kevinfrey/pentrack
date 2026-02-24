import Link from "next/link";
import { NibIcon } from "@/components/Logo";

const FEATURES = [
  {
    icon: "✒️",
    title: "Every pen, every detail",
    description: "Brand, nib specs, fill system, condition, daily carry — all in one place.",
  },
  {
    icon: "✨",
    title: "AI pen identification",
    description: "Upload a photo and Claude AI fills in brand, model, and specs automatically.",
  },
  {
    icon: "🖋️",
    title: "Ink catalog",
    description: "Track every bottle, monitor remaining levels, and log ink history per pen.",
  },
  {
    icon: "⭐",
    title: "Wishlist",
    description: "From practical picks to grail pens — prioritize your next acquisition.",
  },
  {
    icon: "📊",
    title: "Stats & insights",
    description: "Brand breakdown, nib distribution, most-used inks, and total collection value.",
  },
  {
    icon: "🔧",
    title: "Maintenance log",
    description: "Log cleanings and repairs. Never forget when you last serviced a pen.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mini navbar */}
      <nav className="bg-slate-950 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <NibIcon className="h-6 w-6 text-amber-400" />
            <span className="font-playfair text-lg text-white tracking-wide">
              Pen<span className="text-amber-400">ventory</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm px-4 py-2"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-stone-100 border-b border-stone-200 px-4 py-20 sm:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Your fountain pen collection,{" "}
            <span className="text-amber-500">beautifully organized.</span>
          </h1>
          <p className="text-stone-600 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Track every nib, every ink, every story. Penventory keeps your collection at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/register" className="btn-primary text-base px-8 py-3">
              Start for free →
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-6 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-stone-400">No credit card · Your data stays yours</p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="section-card">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-playfair font-semibold text-slate-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App preview */}
      <section className="bg-slate-950 px-4 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white mb-4">
            A home for every pen you love
          </h2>
          <p className="text-slate-400 mb-10 text-sm sm:text-base max-w-xl mx-auto">
            A clean, focused interface designed for fountain pen enthusiasts. No clutter, just your collection.
          </p>

          {/* CSS Mock of Collection UI */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 ml-2 bg-slate-700 rounded h-4 max-w-48 mx-auto" />
              </div>
              {/* Mock nav */}
              <div className="bg-slate-900 px-4 py-2 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400 opacity-80" />
                  <div className="w-14 h-3 bg-slate-600 rounded" />
                </div>
                <div className="flex gap-3 ml-4">
                  {["Collection", "Inks", "Wishlist", "Stats"].map(label => (
                    <div key={label} className="h-2.5 rounded bg-slate-600" style={{ width: `${label.length * 5}px` }} />
                  ))}
                </div>
              </div>
              {/* Mock content */}
              <div className="p-5 bg-stone-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-5 w-32 bg-slate-200 rounded mb-1.5" />
                    <div className="h-3 w-20 bg-stone-200 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-slate-800 rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 overflow-hidden">
                      <div className="h-20 bg-stone-100 flex items-center justify-center">
                        <span className="text-2xl opacity-20">✒️</span>
                      </div>
                      <div className="p-3">
                        <div className="h-3 bg-slate-200 rounded mb-1.5 w-4/5" />
                        <div className="h-2.5 bg-stone-100 rounded w-3/5" />
                        <div className="h-2 bg-stone-100 rounded mt-2 w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-amber-50 border-y border-amber-200 px-4 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-playfair text-3xl font-bold text-slate-900 mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-stone-600 mb-7 text-sm sm:text-base">
            Join pen enthusiasts who use Penventory to organize and celebrate their collections.
          </p>
          <Link href="/register" className="btn-primary text-base px-8 py-3">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <NibIcon className="h-5 w-5 text-amber-400" />
              <span className="font-playfair text-white">
                Pen<span className="text-amber-400">ventory</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm text-center">
              Made for fountain pen enthusiasts
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="text-sm text-slate-400 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-5 text-center">
            <p className="text-slate-600 text-xs">© 2026 Penventory</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
