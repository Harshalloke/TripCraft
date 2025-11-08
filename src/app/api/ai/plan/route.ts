export const dynamic = "force-dynamic";

/* --------------------------- helpers (no APIs) --------------------------- */
type PlanItem = { time: string; title: string; note?: string };
type Day = { date: string; plan: PlanItem[] };

function rangeDates(startISO: string, endISO: string) {
  const out: string[] = [];
  const s = new Date(startISO);
  const e = new Date(endISO);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return out;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const TIME_SLOTS = ["09:00", "11:30", "14:30", "16:30", "19:30", "21:00"];

// Simple normalize title
const norm = (s: string) => (s || "").trim().toLowerCase();

// Remove duplicates by key, preserving order
function dedupe<T>(arr: T[], key: (x: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

// Fallback pools for variety (generic + Himachal/Manali leaning but safe elsewhere)
function fallbackAttractions(dest: string) {
  const city = (dest || "").toLowerCase();
  const common = [
    "Old Town Walk",
    "Local Bazaar Stroll",
    "Riverside Promenade",
    "City Viewpoint",
    "Heritage Museum",
    "Botanical Garden",
    "Popular Temple",
    "Sunset Point",
    "Artisanal Market",
  ];
  if (city.includes("manali")) {
    return [
      "Old Manali Walk",
      "Hadimba Devi Temple",
      "Jogini Waterfall",
      "Vashisht Hot Springs",
      "Van Vihar Walk",
      "Solang Valley Day Trip",
      "Mall Road Stroll",
      "Manu Temple",
      "Beas Riverside Promenade",
      "Siyal Market",
      "Gadhan Thekchhokling Gompa",
      "Nehru Kund Viewpoint",
    ];
  }
  return common;
}

function fallbackEats(dest: string) {
  const city = (dest || "").toLowerCase();
  const common = [
    "Popular Local Cafe",
    "Old Town Street Food Lane",
    "Riverside Diner",
    "Market Corner Eatery",
    "Family Veg Restaurant",
    "Top Rated Dessert Shop",
  ];
  if (city.includes("manali")) {
    return [
      "Cafe 1947",
      "Dylan's Toasted & Roasted",
      "Fat Plate Cafe",
      "Il Forno",
      "Johnson's Cafe",
      "Chopsticks Restaurant",
      "Drifters' Cafe",
    ];
  }
  return common;
}

function fallbackStays(dest: string) {
  const city = (dest || "").toLowerCase();
  const common = [
    "Central Budget Hotel",
    "Best Value Inn",
    "City Boutique Stay",
    "Riverside Resort",
    "Hill View Homestay",
    "Top Rated Lodge",
  ];
  if (city.includes("manali")) {
    return [
      "Johnson Lodge",
      "The Himalayan",
      "Larisa Resort Manali",
      "Apple Country Resort",
      "Snow Valley Resorts",
      "Zostel Manali (Old Manali)",
    ];
  }
  return common;
}

// Build a single day with varied slots
function buildVariedDay(date: string, picks: string[], eats: string[], dest: string): Day {
  const plan: PlanItem[] = [];
  const used = new Set<string>();
  let a = 0, e = 0;

  // Morning — landmark/walk
  if (picks[a]) {
    const t = picks[a++]; used.add(norm(t));
    plan.push({ time: TIME_SLOTS[0], title: t, note: "Morning highlights" });
  }
  // Late morning — temple/museum/park
  if (picks[a]) {
    const t = picks[a++]; used.add(norm(t));
    plan.push({ time: TIME_SLOTS[1], title: t, note: "Short visit" });
  }
  // Lunch
  if (eats[e]) {
    const t = eats[e++]; used.add(norm(t));
    plan.push({ time: TIME_SLOTS[2], title: t, note: "Local lunch" });
  }
  // Afternoon — nature/activity
  if (picks[a]) {
    const t = picks[a++]; used.add(norm(t));
    plan.push({ time: TIME_SLOTS[3], title: t, note: "Light activity" });
  }
  // Evening — sunset/viewpoint
  if (picks[a]) {
    const t = picks[a++]; used.add(norm(t));
    plan.push({ time: TIME_SLOTS[4], title: t, note: "Golden hour photos" });
  }
  // Dinner
  if (eats[e]) {
    const t = eats[e++]; used.add(norm(t));
    plan.push({ time: TIME_SLOTS[5], title: t, note: "Dinner — reserve if needed" });
  }

  // Backfill if short
  const fallA = fallbackAttractions(dest);
  const fallE = fallbackEats(dest);
  let slot = 0;
  while (plan.length < 6 && slot < 12) {
    const pick = slot % 2 === 0 ? fallA : fallE;
    const t = pick[(slot / 2) | 0];
    if (t && !used.has(norm(t))) {
      plan.push({
        time: TIME_SLOTS[Math.min(plan.length, TIME_SLOTS.length - 1)],
        title: t,
        note: slot % 2 === 0 ? "Short stop" : "Quick bite",
      });
      used.add(norm(t));
    }
    slot++;
  }

  return { date, plan: plan.slice(0, 6) };
}

// Rotate stays so each night suggests a different hotel
function attachStays(days: Day[], hotels: { name: string }[]) {
  const uniqHotels = dedupe(hotels, (h) => norm(h.name));
  return days.map((d, i) => {
    const stay = uniqHotels[i % Math.max(1, uniqHotels.length)];
    return { ...d, stayTonight: stay?.name || undefined } as any;
  });
}

/* ---------------------------------- API ---------------------------------- */
export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

  const input = await req.json(); // TripForm
  const {
    origin = "",
    destination = "",
    domestic = true,
    startDate = "",
    endDate = "",
    travelers = { adults: 2, kids: 0 },
    budget = "value",
  } = input || {};

  const dates = rangeDates(startDate, endDate);
  const safeDates = dates.length ? dates : [new Date().toISOString().slice(0, 10)];

  // Stronger prompt: explicit NO REPEATS and daily variety requirement
  const prompt = `
Return STRICT JSON (no markdown). Build a DISTINCT, non-repeating trip plan:

{
  "summary": "one line",
  "days": [
    { "date": "YYYY-MM-DD", "plan": [
      { "time": "09:00", "title": "Place or activity", "note": "short tip" }
    ]}
  ],
  "checkpoints": [{ "name": "Popular spot", "why": "short reason" }],
  "hotels": [{ "name": "Hotel", "note": "why it fits (${budget})", "googleQuery": "Hotel name ${destination}" }],
  "restaurants": [{ "name": "Restaurant", "note": "why", "googleQuery": "Restaurant ${destination}" }],
  "transports": [{ "mode": "flight/train/bus/taxi", "note": "when to use", "googleQuery": "Flights ${origin} to ${destination}" }],
  "costHints": { "stayPerNightHintINR": 0, "foodPerAdultPerDayINR": 0, "attractionsPerAdultINR": 0 },
  "tips": ["compact bullets (no live weather)"],
  "similarPlaces": [{ "place": "Similar city", "why": "vibe/budget similarity" }]
}

Rules:
- Create a day for EACH of these dates: ${safeDates.join(", ")}.
- ABSOLUTELY NO REPEATED titles across all days. Vary neighborhoods/themes.
- Per day: include a landmark walk, a cultural stop, a nature/activity block, a viewpoint/sunset, and two food breaks (lunch & dinner).
- If kids > 0 (${Number(travelers?.kids || 0)}), add family-friendly notes/breaks.
- Respect budget "${budget}" in notes. Max 6 items per day. Keep notes short.

Inputs: origin="${origin}", destination="${destination}", domestic=${domestic}, adults=${Number(
    travelers?.adults || 2
  )}, kids=${Number(travelers?.kids || 0)}.
  `.trim();

  // Call Gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6 },
    }),
  });
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  // Parse JSON (with fallback)
  let json: any = {};
  try {
    json = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}$/);
    if (match) {
      try { json = JSON.parse(match[0]); } catch { json = {}; }
    }
  }

  // Extract & sanitize pools
  const rawDays: Day[] = Array.isArray(json.days) ? json.days : [];
  const rawHotels: any[] = Array.isArray(json.hotels) ? json.hotels : [];
  const rawRestaurants: any[] = Array.isArray(json.restaurants) ? json.restaurants : [];
  const rawChecks: any[] = Array.isArray(json.checkpoints) ? json.checkpoints : [];

  // Build attraction/food pools from AI + fallbacks, deduped
  const aiAttractions = dedupe(
    rawDays.flatMap((d) => (d?.plan || []).map((p: any) => p?.title).filter(Boolean)),
    (t) => norm(String(t))
  ).map(String);

  const aiFoods = dedupe(
    rawRestaurants.map((r) => r?.name).filter(Boolean),
    (t) => norm(String(t))
  ).map(String);

  let attractionPool = dedupe(
    [...aiAttractions, ...fallbackAttractions(destination)],
    (t) => norm(String(t))
  );

  let eatPool = dedupe(
    [...aiFoods, ...fallbackEats(destination)],
    (t) => norm(String(t))
  );

  // Build DISTINCT days using pools (guarantees variety)
  const usedTitles = new Set<string>();
  const days: Day[] = [];

  for (const d of safeDates) {
    // pick 4-6 distinct attraction items not used yet
    const picks: string[] = [];
    for (const t of attractionPool) {
      if (!usedTitles.has(norm(t))) {
        picks.push(t);
        usedTitles.add(norm(t));
      }
      if (picks.length >= 4) break;
    }
    // pick 2 distinct eateries not used yet
    const eats: string[] = [];
    for (const t of eatPool) {
      if (!usedTitles.has(norm(t))) {
        eats.push(t);
        usedTitles.add(norm(t));
      }
      if (eats.length >= 2) break;
    }

    // rotate pools so the next day starts from different positions
    attractionPool = [...attractionPool.slice(3), ...attractionPool.slice(0, 3)];
    eatPool = [...eatPool.slice(2), ...eatPool.slice(0, 2)];

    days.push(buildVariedDay(d, picks, eats, destination));
  }

  // Hotels — keep unique, cap 6, backfill with varied options then rotate per night
  const hotels = dedupe(rawHotels, (h) => norm(h?.name || "")).slice(0, 6);
  const filledHotels =
    hotels.length > 0
      ? hotels
      : fallbackStays(destination).map((n) => ({ name: n, note: "Good base area", googleQuery: `${n} ${destination}` }));

  const finalDays = attachStays(days, filledHotels);

  const out = {
    summary: json.summary ?? `Trip plan for ${destination}`,
    days: finalDays, // each day is distinct and varied
    checkpoints: rawChecks,
    hotels: filledHotels,
    restaurants: rawRestaurants.length
      ? dedupe(rawRestaurants, (x) => norm(x.name || "")).slice(0, 6)
      : fallbackEats(destination).slice(0, 6).map((n) => ({ name: n, note: "Popular choice", googleQuery: `${n} ${destination}` })),
    transports: Array.isArray(json.transports) ? json.transports : [],
    costHints:
      typeof json.costHints === "object" && json.costHints
        ? json.costHints
        : { stayPerNightHintINR: 0, foodPerAdultPerDayINR: 0, attractionsPerAdultINR: 0 },
    tips: Array.isArray(json.tips) ? json.tips : [],
    similarPlaces: Array.isArray(json.similarPlaces) ? json.similarPlaces : [],
  };

  return Response.json(out);
}
