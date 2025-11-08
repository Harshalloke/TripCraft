"use client";

import CostSummary from "@/components/CostSummary";
import { useTrip } from "@/lib/store";
import {
  gmapsDirectionsLink,
  hotelsLink,
  restaurantsLink,
  attractionsLink,
  googleFlightsSearch,
  gmapsSearchLink,
} from "@/lib/deeplinks";
import { estimateCostsINR } from "@/lib/costs";
import { useMemo, useRef, useState } from "react";

/* --------------------- Local helpers (no external APIs) --------------------- */
type Interest = "culture" | "nature" | "food" | "shopping" | "adventure" | "kids";

const INTEREST_TAGS: { key: Interest; label: string }[] = [
  { key: "culture", label: "Culture" },
  { key: "nature", label: "Nature" },
  { key: "food", label: "Food" },
  { key: "shopping", label: "Shopping" },
  { key: "adventure", label: "Adventure" },
  { key: "kids", label: "Kids" },
];

const googleImagesLink = (q: string) =>
  `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;

function clampItemsByIntensity<T>(list: T[] = [], intensity: "relaxed" | "standard" | "packed") {
  const maxMap = { relaxed: 4, standard: 6, packed: 9 };
  return list.slice(0, maxMap[intensity]);
}

function interestScore(title: string, interests: Interest[]) {
  const t = (title || "").toLowerCase();
  const checks: Record<Interest, string[]> = {
    culture: ["museum", "temple", "church", "palace", "heritage", "gallery", "historic", "fort"],
    nature: ["park", "garden", "beach", "lake", "waterfall", "trail", "forest", "viewpoint", "valley"],
    food: ["cafe", "restaurant", "street food", "brew", "diner", "eatery"],
    shopping: ["market", "bazaar", "mall", "shopping", "souvenir"],
    adventure: ["trek", "zip", "rafting", "surf", "climb", "paragliding", "kayak", "ski"],
    kids: ["aquarium", "zoo", "theme park", "toy", "science", "play"],
  };
  let score = 0;
  for (const k of interests) if (checks[k].some((kw) => t.includes(kw))) score += 1;
  return score;
}

function refineDays(
  aiDays:
    | Array<{ date: string; plan: Array<{ time: string; title: string; note?: string }> }>
    | undefined,
  intensity: "relaxed" | "standard" | "packed",
  interests: Interest[]
) {
  if (!aiDays?.length) return [];
  return aiDays.map((d) => {
    const ranked = [...(d.plan || [])].sort(
      (a, b) => interestScore(b.title, interests) - interestScore(a.title, interests)
    );
    return { ...d, plan: clampItemsByIntensity(ranked, intensity) };
  });
}

function rangeDates(startISO?: string, endISO?: string) {
  const out: string[] = [];
  const s = startISO ? new Date(startISO) : undefined;
  const e = endISO ? new Date(endISO) : undefined;
  if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return out;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function clientFallbackDays(destination: string, startISO?: string, endISO?: string) {
  const dates = rangeDates(startISO, endISO);
  const safe = dates.length ? dates : [new Date().toISOString().slice(0, 10)];
  return safe.map((d, idx) => ({
    date: d,
    plan: [
      { time: "09:00", title: idx % 2 ? "Old Manali Walk" : "Mall Road Stroll", note: "Coffee & photo spots" },
      { time: "11:00", title: idx % 3 ? "Hadimba Devi Temple" : "Van Vihar Park", note: "Short visit" },
      { time: "13:00", title: "Local lunch", note: "Try siddu / dham" },
      { time: "15:00", title: idx % 2 ? "Jogini Waterfall" : "Vashisht Hot Springs", note: "Nature time" },
      { time: "18:00", title: idx % 2 ? "Beas Riverside Promenade" : "Sunset viewpoint", note: "Golden hour" },
      { time: "21:00", title: "Dinner spot", note: "Popular local place" },
    ],
  }));
}

function makePackingList({
  nights,
  adults,
  kids,
  intensity,
  interests,
}: {
  nights: number;
  adults: number;
  kids: number;
  intensity: "relaxed" | "standard" | "packed";
  interests: Interest[];
}) {
  const base = [
    "Passport/ID, tickets, wallet",
    "Phone + charger + power bank",
    "Light jacket / rain layer",
    "Comfortable shoes + spare socks",
    "Med kit (pain relief, band-aids, personal meds)",
    "Reusable water bottle",
  ];
  const kidsItems = kids > 0 ? ["Snacks for kids", "Wipes/tissues", "Small games/books"] : [];
  const sunshine = interests.includes("nature") ? ["Sunscreen", "Hat/sunglasses"] : [];
  const adv = interests.includes("adventure") ? ["Sports shoes", "Dry bag", "Action camera (optional)"] : [];
  const camera = ["Travel adapter", "Camera (optional)"];
  const stay = nights >= 3 ? ["Laundry bag"] : [];
  const busy = intensity === "packed" ? ["Electrolyte sachets", "Band-aids for blisters"] : [];
  return [...base, ...kidsItems, ...sunshine, ...adv, ...camera, ...stay, ...busy];
}

function safeNights(startISO?: string, endISO?: string) {
  const s = startISO ? new Date(startISO) : null;
  const e = endISO ? new Date(endISO) : null;
  if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  const n = Math.ceil((e.getTime() - s.getTime()) / 86400000);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------- Component -------------------------------- */
export default function TripPage() {
  const { form, aiPlan, setAIPlan } = useTrip();

  const [intensity, setIntensity] = useState<"relaxed" | "standard" | "packed">("standard");
  const [interests, setInterests] = useState<Interest[]>(["culture", "food"]);
  const [loading, setLoading] = useState(false);

  // (Optional) container for print-to-PDF libs if you use them
  const pdfRef = useRef<HTMLDivElement>(null);

  if (!form) return <div className="text-gray-600">No trip in session. Go to Plan.</div>;

  const nights = safeNights(form.startDate, form.endDate);
  const cost = estimateCostsINR({
    nights,
    travelers: { adults: Number(form.travelers?.adults ?? 1), kids: Number(form.travelers?.kids ?? 0) },
    budget: (form.budget as "cheap" | "value" | "top") ?? "value",
  });

  // Use API plan if available; otherwise client fallback
  const baseDays =
    aiPlan?.days && aiPlan.days.length > 0
      ? aiPlan.days
      : clientFallbackDays(form.destination, form.startDate, form.endDate);

  const refinedDays = useMemo(
    () => refineDays(baseDays as any, intensity, interests),
    [baseDays, intensity, interests]
  );

  const packingList = useMemo(
    () =>
      makePackingList({
        nights,
        adults: Number(form.travelers.adults ?? 1),
        kids: Number(form.travelers.kids ?? 0),
        intensity,
        interests,
      }),
    [nights, form.travelers.adults, form.travelers.kids, intensity, interests]
  );

  const itineraryPlain = useMemo(() => {
    const header = `${form.destination} (${form.startDate || "Start"} → ${form.endDate || "End"}) — ${form.travelers.adults} adults, ${form.travelers.kids} kids\n\n`;
    const body = refinedDays
      .map(
        (d: any, i: number) =>
          `Day ${i + 1} — ${d.date}\n` +
          (d.plan || [])
            .map((p: any) => `  ${p.time}  ${p.title}${p.note ? ` — ${p.note}` : ""}`)
            .join("\n")
      )
      .join("\n\n");
    return header + (body || "No itinerary yet.");
  }, [refinedDays, form.destination, form.startDate, form.endDate, form.travelers.adults, form.travelers.kids]);

  const regeneratePlan = async () => {
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
      alert("Failed to generate plan. Check GEMINI_API_KEY and Network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(1000px 600px at 20% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(900px 500px at 100% 20%, rgba(168,85,247,0.12), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6" ref={pdfRef}>
        {/* Header Card */}
        <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{form.destination}</h1>
                <p className="mt-1 text-sm md:text-base text-white/80">
                  {form.startDate || "Start"} → {form.endDate || "End"} • {form.travelers.adults} adults, {form.travelers.kids} kids
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.domestic && form.origin && (
                  <a
                    className="rounded-full bg-white text-black px-4 py-2 text-sm hover:bg-white/90 transition border border-white/20"
                    href={gmapsDirectionsLink(form.origin!, form.destination, "driving")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Directions
                  </a>
                )}
                <button
                  className="rounded-full bg-white text-black px-4 py-2 text-sm hover:bg-white/90 transition border border-white/20"
                  onClick={() => window.print()}
                >
                  Print / PDF
                </button>
                <button
                  className="rounded-full bg-white text-black px-4 py-2 text-sm hover:bg-white/90 transition border border-white/20"
                  onClick={async () => {
                    const ok = await copyToClipboard(itineraryPlain);
                    if (!ok) alert("Copy failed. Try selecting text and copying manually.");
                  }}
                >
                  Copy Itinerary
                </button>
                <button
                  disabled={loading}
                  className="rounded-full bg-white text-black px-4 py-2 text-sm hover:bg-white/90 transition border border-white/20 disabled:opacity-60"
                  onClick={regeneratePlan}
                >
                  {loading ? "Generating…" : aiPlan?.days?.length ? "Regenerate AI Plan" : "Generate AI Plan"}
                </button>
              </div>
            </div>

            {!!aiPlan?.summary && <p className="mt-4 text-sm md:text-base text-white/90">{aiPlan.summary}</p>}
          </div>
        </section>

        {/* Refine */}
        <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-6">
          <div className="mb-3 text-sm font-semibold tracking-wide uppercase text-white/70">Refine itinerary</div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Intensity */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Intensity:</span>
              {(["relaxed", "standard", "packed"] as const).map((lvl) => (
                <button
                  key={lvl}
                  className={`rounded-full px-3 py-1 text-xs border ${intensity === lvl ? "bg-white text-black" : "border-white/30 text-white/85"}`}
                  onClick={() => setIntensity(lvl)}
                >
                  {lvl[0].toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>

            {/* Interests */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/70">Interests:</span>
              {INTEREST_TAGS.map((t) => (
                <button
                  key={t.key}
                  className={`rounded-full px-3 py-1 text-xs border ${interests.includes(t.key) ? "bg-white text-black" : "border-white/30 text-white/85"}`}
                  onClick={() =>
                    setInterests((prev) => (prev.includes(t.key) ? prev.filter((x) => x !== t.key) : [...prev, t.key]))
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Itinerary + Costs */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Itinerary */}
          <div className="md:col-span-2 space-y-6">
            {refinedDays.map((d: any, i: number) => (
              <article
                key={i}
                className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl overflow-hidden"
              >
                {/* Day header (no image) */}
                <div className="relative h-24 md:h-28">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/40 via-fuchsia-700/30 to-sky-700/30 backdrop-blur-sm" />
                  <div className="absolute inset-0 flex items-end justify-between px-4 pb-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/80">Day {i + 1}</div>
                      <h3 className="text-lg md:text-xl font-semibold">{d.date}</h3>
                    </div>
                    {(d as any).stayTonight && (
                      <div className="text-xs md:text-sm text-white/90">
                        Stay: <span className="font-medium">{(d as any).stayTonight}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day body */}
                <div className="p-5 md:p-6">
                  <ul className="grid gap-3">
                    {(d.plan || []).map((b: { time: string; title: string; note?: string }, j: number) => (
                      <li
                        key={j}
                        className="rounded-2xl border border-white/15 bg-white/5 p-3 md:p-4 flex gap-3 md:gap-4 items-start"
                      >
                        {/* Time badge */}
                        <div className="h-8 w-12 shrink-0 rounded-lg bg-white/10 border border-white/15 grid place-items-center text-xs font-medium">
                          {b.time?.slice(0, 5) || "—"}
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                          <div className="font-medium leading-tight">{b.title}</div>
                          {b.note && <div className="text-xs text-white/75 mt-0.5">{b.note}</div>}

                          <div className="mt-2 flex flex-wrap gap-2">
                            <a
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                              target="_blank"
                              rel="noreferrer"
                              href={gmapsSearchLink(`${b.title} ${form.destination}`)}
                            >
                              Open in Maps
                            </a>
                            <a
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                              target="_blank"
                              rel="noreferrer"
                              href={googleImagesLink(`${b.title} ${form.destination}`)}
                            >
                              More Photos
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* Costs */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-5">
              <h4 className="mb-2 text-sm font-semibold tracking-wide uppercase text-white/70">Estimated Costs</h4>
              <CostSummary items={cost.items as any} total={cost.total} perPerson={cost.perPerson} />
              <div className="mt-4 text-xs text-white/70">Quick budget view</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["cheap", "value", "top"] as const).map((b) => {
                  const quick = estimateCostsINR({
                    nights,
                    travelers: {
                      adults: Number(form.travelers.adults ?? 1),
                      kids: Number(form.travelers.kids ?? 0),
                    },
                    budget: b,
                  });
                  return (
                    <div key={b} className="rounded-2xl border border-white/15 bg-white/5 p-2 text-center">
                      <div className="text-[10px] uppercase text-white/60">{b}</div>
                      <div className="text-sm font-semibold">{quick.total.toLocaleString("en-IN")}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-5">
              <h4 className="mb-2 text-sm font-semibold tracking-wide uppercase text-white/70">Quick links</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                   target="_blank" rel="noreferrer" href={hotelsLink(form.destination)}>Hotels</a>
                <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                   target="_blank" rel="noreferrer" href={restaurantsLink(form.destination)}>Restaurants</a>
                <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                   target="_blank" rel="noreferrer" href={attractionsLink(form.destination)}>Attractions</a>
                <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                   target="_blank" rel="noreferrer" href={gmapsSearchLink(`family friendly activities ${form.destination}`)}>Family</a>
                <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                   target="_blank" rel="noreferrer" href={gmapsSearchLink(`street food ${form.destination}`)}>Street Food</a>
                <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                   target="_blank" rel="noreferrer" href={gmapsSearchLink(`best viewpoints ${form.destination}`)}>Viewpoints</a>
                {form.origin && (
                  <a className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                     target="_blank" rel="noreferrer" href={googleFlightsSearch(form.origin, form.destination, form.startDate)}>
                    Flights
                  </a>
                )}
              </div>
            </div>
          </aside>
        </section>

        {/* AI-suggested stays */}
        {aiPlan?.hotels?.length ? (
          <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-6">
            <h4 className="mb-4 text-sm font-semibold tracking-wide uppercase text-white/70">AI-suggested stays</h4>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiPlan.hotels.map((h: { name: string; note?: string; googleQuery?: string }, i: number) => (
                <li key={i} className="rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                  <div className="h-10 bg-white/5 border-b border-white/10" />
                  <div className="p-3">
                    <div className="font-medium">{h.name}</div>
                    {h.note && <div className="text-xs text-white/80 mt-0.5">{h.note}</div>}
                    <div className="mt-2 flex gap-2">
                      <a
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                        target="_blank"
                        rel="noreferrer"
                        href={gmapsSearchLink(h.googleQuery || `${h.name} ${form.destination}`)}
                      >
                        Maps
                      </a>
                      <a
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                        target="_blank"
                        rel="noreferrer"
                        href={googleImagesLink(h.googleQuery || `${h.name} ${form.destination}`)}
                      >
                        More Photos
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* AI-suggested restaurants */}
        {aiPlan?.restaurants?.length ? (
          <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-6">
            <h4 className="mb-4 text-sm font-semibold tracking-wide uppercase text-white/70">AI-suggested restaurants</h4>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiPlan.restaurants.map((h: { name: string; note?: string; googleQuery?: string }, i: number) => (
                <li key={i} className="rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                  <div className="h-10 bg-white/5 border-b border-white/10" />
                  <div className="p-3">
                    <div className="font-medium">{h.name}</div>
                    {h.note && <div className="text-xs text-white/80 mt-0.5">{h.note}</div>}
                    <div className="mt-2 flex gap-2">
                      <a
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                        target="_blank"
                        rel="noreferrer"
                        href={gmapsSearchLink(h.googleQuery || `${h.name} ${form.destination}`)}
                      >
                        Maps
                      </a>
                      <a
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                        target="_blank"
                        rel="noreferrer"
                        href={googleImagesLink(h.googleQuery || `${h.name} ${form.destination}`)}
                      >
                        More Photos
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Tips */}
        {aiPlan?.tips?.length ? (
          <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-6">
            <h4 className="mb-2 text-sm font-semibold tracking-wide uppercase text-white/70">AI Tips</h4>
            <ul className="list-inside list-disc text-sm">
              {aiPlan.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </section>
        ) : null}

        {/* Packing List */}
        <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-6">
          <h4 className="mb-2 text-sm font-semibold tracking-wide uppercase text-white/70">Packing list (auto)</h4>
          <ul className="list-inside list-disc text-sm">
            {packingList.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>

        {/* Similar places */}
        {aiPlan?.similarPlaces?.length ? (
          <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-2xl p-4 md:p-6">
            <h4 className="mb-2 text-sm font-semibold tracking-wide uppercase text-white/70">Similar places</h4>
            <ul className="list-inside list-disc text-sm">
              {aiPlan.similarPlaces.map((s: { place: string; why?: string }, i: number) => (
                <li key={i}><b>{s.place}</b>{s.why ? `: ${s.why}` : ""}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {/* Print styles for contrast */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-white\\/10, .backdrop-blur-xl, .bg-white\\/5 { background: #ffffff !important; }
          .text-white, .text-white\\/80, .text-white\\/85, .text-white\\/90, .text-white\\/70 { color: #111 !important; }
          .border-white\\/15, .border-white\\/20, .border-white\\/30 { border-color: #ddd !important; }
        }
      `}</style>
    </main>
  );
}
