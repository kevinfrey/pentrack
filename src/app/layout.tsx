import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { NibIcon } from "@/components/Logo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PenTrack",
  description: "Track your fountain pen collection",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="min-h-screen">
        <header className="bg-slate-950 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <NibIcon className="h-7 w-7 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="font-playfair text-xl text-white tracking-wide">
                Pen<span className="text-amber-400 group-hover:text-amber-300 transition-colors">Track</span>
              </span>
            </Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
