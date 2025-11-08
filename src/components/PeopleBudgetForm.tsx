"use client";
import { useState } from "react";
import { TripForm } from "@/lib/types";

export default function PeopleBudgetForm({
  onSubmit,
}: {
  onSubmit: (f: TripForm) => void;
}) {
  const [form, setForm] = useState<TripForm>({
    origin: "",
    destination: "",
    domestic: true,
    startDate: "",
    endDate: "",
    travelers: { adults: 2, kids: 0 },
    budget: "value",
  });

  const inc = (key: "adults" | "kids", step = 1) =>
    setForm((f) => ({
      ...f,
      travelers: {
        ...f.travelers,
        [key]: Math.max( key === "adults" ? 1 : 0, Number(f.travelers[key] ?? 0) + step ),
      },
    }));

  const dec = (key: "adults" | "kids", step = 1) => inc(key, -step);

  const canSubmit =
    (form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate)) ?? false;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid gap-5"
    >
      {/* Row 1: Origin / Destination */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            Origin (city)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
              {/* plane takeoff icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 19h20M2.5 11l7 1.5 7.5-5L22 8l-8.5 7L7 13.5 4 12l-1.5-.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-white/15 bg-white/5 px-10 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
              placeholder="e.g., Mumbai"
              value={form.origin || ""}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            Destination (city / country)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
              {/* map pin icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-white/15 bg-white/5 px-10 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
              placeholder="e.g., Manali or Bali"
              value={form.destination}
              onChange={(e) =>
                setForm({ ...form, destination: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Row 2: Domestic + Dates */}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white/90">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/30 bg-transparent accent-white"
            checked={form.domestic}
            onChange={(e) => setForm({ ...form, domestic: e.target.checked })}
          />
          <span>Domestic trip (show driving directions)</span>
        </label>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            Start date
          </label>
          <input
            type="date"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            End date
          </label>
          <input
            type="date"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Row 3: Travelers + Budget */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Adults stepper */}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            Adults
          </label>
          <div className="flex items-stretch rounded-xl border border-white/15 bg-white/5">
            <button
              type="button"
              onClick={() => dec("adults")}
              className="px-3 text-white/90 hover:bg-white/10"
              aria-label="Decrease adults"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              className="w-full bg-transparent px-3 py-2.5 text-center text-sm text-white outline-none"
              value={form.travelers.adults}
              onChange={(e) =>
                setForm({
                  ...form,
                  travelers: {
                    ...form.travelers,
                    adults: Math.max(1, Number(e.target.value || 1)),
                  },
                })
              }
            />
            <button
              type="button"
              onClick={() => inc("adults")}
              className="px-3 text-white/90 hover:bg-white/10"
              aria-label="Increase adults"
            >
              +
            </button>
          </div>
        </div>

        {/* Kids stepper */}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            Kids
          </label>
          <div className="flex items-stretch rounded-xl border border-white/15 bg-white/5">
            <button
              type="button"
              onClick={() => dec("kids")}
              className="px-3 text-white/90 hover:bg-white/10"
              aria-label="Decrease kids"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              className="w-full bg-transparent px-3 py-2.5 text-center text-sm text-white outline-none"
              value={form.travelers.kids}
              onChange={(e) =>
                setForm({
                  ...form,
                  travelers: {
                    ...form.travelers,
                    kids: Math.max(0, Number(e.target.value || 0)),
                  },
                })
              }
            />
            <button
              type="button"
              onClick={() => inc("kids")}
              className="px-3 text-white/90 hover:bg-white/10"
              aria-label="Increase kids"
            >
              +
            </button>
          </div>
        </div>

        {/* Budget select (readable popup) */}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">
            Budget
          </label>
          <select
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value as any })}
          >
            {/* Make popup menu readable in Chrome/Edge */}
            <option className="text-black" value="cheap">Budget / Cheap</option>
            <option className="text-black" value="value">Best Value</option>
            <option className="text-black" value="top">Top / Premium</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/70">
          Tip: Toggle <b>Domestic</b> to enable Google driving directions on the trip page.
        </p>
        <button
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
          disabled={!canSubmit}
        >
          Plan my trip
        </button>
      </div>
    </form>
  );
}
