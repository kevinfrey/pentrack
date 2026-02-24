import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { NibIcon } from "@/components/Logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <>
      <header className="bg-slate-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/collection" className="flex items-center gap-2.5 group">
            <NibIcon className="h-7 w-7 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <span className="font-playfair text-xl text-white tracking-wide">
              Pen<span className="text-amber-400 group-hover:text-amber-300 transition-colors">ventory</span>
            </span>
          </Link>
          <form action={handleSignOut}>
            <button type="submit" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
        <nav className="border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 flex gap-1">
            <NavLink href="/collection">Collection</NavLink>
            <NavLink href="/inks">Inks</NavLink>
            <NavLink href="/wishlist">Wishlist</NavLink>
            <NavLink href="/stats">Stats</NavLink>
          </div>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
