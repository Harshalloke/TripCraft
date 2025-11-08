import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header"; // <-- new client component
import Link from "next/link";

export const metadata: Metadata = {
  title: "TripCraft – AI Travel Planner",
  description: "Smart itineraries with AI, direct Google links, zero paid APIs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
        {/* Header (Client Component) */}
        <Header />

        <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>

        <footer className="mx-auto mt-12 max-w-7xl border-t border-white/10 py-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} <b>TripCraft</b>. Built with ❤️ for smarter adventures.
        </footer>
      </body>
    </html>
  );
}
