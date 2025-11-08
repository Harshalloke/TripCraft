"use client";

import PeopleBudgetForm from "@/components/PeopleBudgetForm";
import { useState } from "react";
import { useTrip } from "@/lib/store";
import { TripForm } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function PlanPage() {
  const [dest, setDest] = useState("");
  const [loading, setLoading] = useState(false);
  const { setForm, setAIPlan } = useTrip();
  const router = useRouter();

  const handleSubmit = async (base: TripForm) => {
    const form: TripForm = { ...base, destination: dest || base.destination };
    if (!form.destination || !form.destination.trim()) {
      alert("Please enter a destination");
      return;
    }
    setForm(form);

    try {
      setLoading(true);
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const ai = await res.json();
      setAIPlan(ai);
    } catch (e) {
      console.error(e);
      alert("Could not generate AI plan. Check your GEMINI_API_KEY.");
    } finally {
      setLoading(false);
    }

    const slug = form.destination.toLowerCase().replace(/\s+/g, "-");
    router.push(`/trip/${encodeURIComponent(slug)}`);
  };

  const setQuick = (v: string) => setDest(v);

  return (
    <main className="relative min-h-[80dvh]">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(1000px 600px at 20% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(900px 500px at 100% 20%, rgba(168,85,247,0.12), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-5xl p-4 md:p-8">
        {/* Heading */}
        <header className="mb-6 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Plan your trip</h1>
          <p className="mt-1 text-sm md:text-base text-white/80">
            Tell me where you’re going and I’ll craft a personalized itinerary, costs, and quick booking links.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-5">
          {/* Form card */}
          <div className="md:col-span-3 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-5 md:p-6">
            <div className="mb-4 text-base md:text-lg font-semibold">Trip details</div>

            {/* Destination input */}
            <label className="block text-xs uppercase tracking-wide text-white/70 mb-2">
              Destination
            </label>
            <div className="relative mb-3">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                {/* Map Pin icon (inline SVG, no deps) */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Z" stroke="currentColor" strokeWidth="1.6"/>
                  <circle cx="12" cy="10" r="2.8" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              </span>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/5 px-10 py-3 text-sm placeholder-white/50 outline-none focus:border-white/30"
                placeholder="City or country (e.g., Manali, Bali, Paris)"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // delegate submit to PeopleBudgetForm's submit trigger
                    const btn = document.getElementById("plan-submit-proxy");
                    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                  }
                }}
              />
              {dest && (
                <button
                  aria-label="Clear"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[10px] hover:bg-white/20"
                  onClick={() => setDest("")}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick suggestions */}
            <div className="mb-6 flex flex-wrap gap-2">
              {["Manali", "Goa", "Jaipur", "Bali", "Dubai", "Paris"].map((q) => (
                <button
                  key={q}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                  onClick={() => setQuick(q)}
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* People + Budget form (your component) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <PeopleBudgetForm onSubmit={handleSubmit} />
            </div>

            {/* Submit status */}
            <div className="mt-3 h-6">
              {loading ? (
                <div className="inline-flex items-center gap-2 text-sm text-white/80">
                  <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-white/70" />
                  Generating plan…
                </div>
              ) : (
                <button
                  id="plan-submit-proxy"
                  type="button"
                  className="hidden"
                  onClick={() => {
                    // noop proxy to trigger Enter from destination field if your PeopleBudgetForm handles submit itself
                  }}
                />
              )}
            </div>
          </div>

          {/* Info card */}
          <aside className="md:col-span-2 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-5 md:p-6">
            <div className="text-base md:text-lg font-semibold mb-2">What you’ll get</div>
            <ul className="list-inside list-disc text-sm space-y-2 text-white/90">
              <li>Day-by-day itinerary (adjust by interests & intensity)</li>
              <li>Cost breakdown with per-person estimate</li>
              <li>Quick links for Hotels, Food, Attractions, Flights</li>
              <li>“More Photos” & Maps for each spot</li>
              <li>Auto packing list + AI tips</li>
            </ul>

            <div className="mt-6 text-xs text-white/70">
              Tip: Type a destination and press <span className="px-1 rounded bg-white/10 border border-white/10">Enter</span> to submit.
            </div>

            {/* Badges */}
            
          </aside>
        </section>
      </div>

      {/* Print styles (keeps contrast) */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-white\\/10, .backdrop-blur-xl, .bg-white\\/5 { background: #ffffff !important; }
          .text-white, .text-white\\/80, .text-white\\/70, .text-white\\/90 { color: #111 !important; }
          .border-white\\/15, .border-white\\/10, .border-white\\/20 { border-color: #ddd !important; }
        }
      `}</style>

      {/* Page-level loading overlay (subtle) */}
      {loading && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white text-sm shadow-xl">
            Crafting your itinerary…
          </div>
        </div>
      )}
    </main>
  );
}
