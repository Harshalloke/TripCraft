"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/** Curated image set (you can replace with your own urls or local /public files) */
const HERO_IMAGES = [
  // Wide scenic images look best (16:9 or wider)
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop",
];

const FEATURED = [
  {
    name: "Manali",
    q: "Manali Himachal Pradesh",
    img: "https://www.oyorooms.com/travel-guide/wp-content/uploads/2019/11/Top-4-Indian-skiing-destinations-Solang.webp",
  },
  {
    name: "Goa",
    q: "Goa beaches",
    img: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Jaipur",
    q: "Jaipur fort",
    img: "https://letourdeindia.com/wp-content/uploads/2019/05/jaipur-photography-tour-2-768x507.jpg",
  },
  {
    name: "Bali",
    q: "Bali rice terraces",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Dubai",
    q: "Dubai skyline",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Paris",
    q: "Paris Eiffel",
    img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop",
  },
];

function classNames(...x: (string | false | null | undefined)[]) {
  return x.filter(Boolean).join(" ");
}

function SafeBG({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [ok, setOk] = useState(true);
  const [finalSrc, setFinalSrc] = useState(src);

  // Preload image and set fallback if it fails
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setOk(true);
    img.onerror = () => !cancelled && setOk(false);
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    setFinalSrc(src);
  }, [src]);

  return (
    <div className={className}>
      {ok ? (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${finalSrc})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(168,85,247,0.2),transparent)] bg-slate-950" />
      )}
      {children}
    </div>
  );
}

export default function Page() {
  const [idx, setIdx] = useState(0);
  const intervalMs = 4500;
  const fadeMs = 800;

  // Auto-advance slideshow
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_IMAGES.length), intervalMs);
    return () => clearInterval(t);
  }, []);

  const currentSrc = useMemo(() => HERO_IMAGES[idx], [idx]);

  return (
    <main className="relative min-h-[100dvh] text-white">
      {/* Global gradient background */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(1000px 600px at 20% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(900px 500px at 100% 20%, rgba(168,85,247,0.12), transparent 60%)",
        }}
      />

      {/* HERO */}
      <section className="relative isolate">
        {/* Slideshow layer */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <SafeBG src={currentSrc} className="absolute inset-0">
            {/* Darken for readability */}
            <div className="absolute inset-0 bg-black/40" />
          </SafeBG>

          {/* Crossfade effect by stacking (prev/next) images */}
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              className={classNames(
                "absolute inset-0 bg-center bg-cover transition-opacity",
                idx === i ? "opacity-100" : "opacity-0"
              )}
              style={{
                backgroundImage: `url(${src})`,
                transitionDuration: `${fadeMs}ms`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Hero content */}
        <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> AI Trip Builder
            </div>

            <h1 className="mt-4 text-3xl leading-tight font-semibold md:text-5xl">
              Plan smarter trips with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-sky-200">
                TripCraft
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-white/90 md:text-lg">
              Instant itineraries, checkpoints, packing lists, cost breakdowns, and direct Google
              links for bookings — in one beautiful place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/plan"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black shadow-lg shadow-black/20 hover:bg-white/90"
              >
                Start planning
              </Link>
              <a
                href="https://www.google.com/search?tbm=isch&q=best+travel+destinations"
                target="_blank"
                className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm hover:bg-white/20"
              >
                Explore photos
              </a>
            </div>

            {/* Hero quick chips */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {["Manali", "Goa", "Jaipur", "Bali", "Dubai", "Paris"].map((q) => (
                <Link
                  key={q}
                  href={`/plan?dest=${encodeURIComponent(q)}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 hover:bg-white/20"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold md:text-2xl">Trending destinations</h2>
          <div className="text-xs text-white/70">Curated picks • Updated often</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((d) => (
            <article
              key={d.name}
              className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-xl"
            >
              {/* Card bg image */}
              <div
                className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${d.img})` }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="relative p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{d.name}</h3>
                    <p className="text-xs text-white/80">
                      Handpicked spots, food, and stays
                    </p>
                  </div>
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-black">
                    Hot
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/plan?dest=${encodeURIComponent(d.name)}`}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/90"
                  >
                    Plan {d.name}
                  </Link>
                  <a
                    target="_blank"
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(d.q)}`}
                  >
                    More photos
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURES / VALUE */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "AI itinerary",
              d: "Day-by-day plans tailored to your interests and pace.",
              i: (
                <svg width="22" height="22" viewBox="0 0 24 24" className="text-indigo-200">
                  <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              t: "Cost breakdown",
              d: "Live estimates per person with quick budget toggles.",
              i: (
                <svg width="22" height="22" viewBox="0 0 24 24" className="text-fuchsia-200">
                  <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              t: "Direct links",
              d: "Open in Google: hotels, restaurants, attractions, flights.",
              i: (
                <svg width="22" height="22" viewBox="0 0 24 24" className="text-sky-200">
                  <path d="M14 3h7v7M21 3l-9 9M5 7h4M5 17h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              ),
            },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">{f.i}</div>
                <h3 className="text-base font-semibold">{f.t}</h3>
              </div>
              <p className="mt-2 text-sm text-white/85">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-xl">
          <div>
            <div className="text-base font-semibold">Ready to build your trip?</div>
            <div className="text-sm text-white/80">Takes less than a minute. No sign-in required.</div>
          </div>
          <Link
            href="/plan"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
          >
            Start planning
          </Link>
        </div>
      </section>

      {/* Page padding for mobile safe area */}
      <div className="h-6" />
    </main>
  );
}
