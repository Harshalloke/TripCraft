"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 mx-auto w-full border-b border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight md:text-xl"
        >
          <span className="rounded-lg bg-white px-2 py-1 text-black font-bold shadow-sm">
            TC
          </span>
          <span className="text-white/90 hover:text-white transition">TripCraft</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/plan" className="hover:text-white transition">Plan</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </nav>

        {/* CTA */}
        <Link
          href="/plan"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 transition md:inline-block hidden"
        >
          Start Planning
        </Link>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col items-start gap-3 px-6 py-4 text-sm text-white/90">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/plan" className="hover:text-white transition">Plan</Link>
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link
              href="/plan"
              className="mt-2 w-full rounded-full bg-white px-4 py-2 text-center text-sm font-medium text-black hover:bg-white/90 transition"
            >
              Start Planning
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
