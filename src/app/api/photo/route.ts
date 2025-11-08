// Next.js Route Handler: /api/place-photo?q=Jogini%20Waterfall&w=1000&h=600
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";

// ---------- utils ----------
function timeoutSignal(ms = 8000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return { signal: ac.signal, cleanup: () => clearTimeout(t) };
}

async function j<T = any>(url: string, signal?: AbortSignal) {
  const r = await fetch(url, {
    headers: { "User-Agent": "TripPlanner/1.0 (+contact@example.com)" },
    next: { revalidate: 3600 },
    signal,
  });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as T;
}

// ---------- Wikipedia / Wikimedia ----------
async function wikiFindTitle(q: string, lang = "en", signal?: AbortSignal) {
  const url = `https://${lang}.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(
    q
  )}&limit=1`;
  const data = await j<{ pages?: Array<{ title: string }> }>(url, signal);
  return data?.pages?.[0]?.title ?? null;
}

async function wikiSummary(title: string, lang = "en", signal?: AbortSignal) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  return await j<{
    thumbnail?: { source: string };
    originalimage?: { source: string };
  }>(url, signal);
}

async function commonsThumb(query: string, width: number, signal?: AbortSignal) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&gsrlimit=1&iiprop=url&iiurlwidth=${width}`;
  const data = await j<any>(api, signal);
  const pages = data?.query?.pages;
  if (!pages) return null;
  const first = Object.values(pages)[0] as any;
  const ii = first?.imageinfo?.[0];
  return ii?.thumburl ?? null;
}

// ---------- Openverse (no key) ----------
async function openverseImage(query: string, signal?: AbortSignal) {
  const api = `https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(
    query
  )}&page_size=1&excluded_source=flickr`; // flickr sometimes 403s thumbnails
  const data = await j<{
    results?: Array<{ thumbnail?: string; url?: string }>;
  }>(api, signal);
  const item = data?.results?.[0];
  return item?.thumbnail || item?.url || null;
}

// ---------- Picsum fallback ----------
function picsumSeed(w: number, h: number, seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

// ---------- Resolver ----------
async function resolveURL(query: string, w: number, h: number, signal?: AbortSignal) {
  const q = query.trim();

  // A) Wikipedia EN → thumbnail/original
  const tEn = await wikiFindTitle(q, "en", signal);
  if (tEn) {
    const sum = await wikiSummary(tEn, "en", signal);
    if (sum?.thumbnail?.source) return sum.thumbnail.source;
    if (sum?.originalimage?.source) return sum.originalimage.source;
  }

  // B) Wikipedia HI (helpful for Indian POIs)
  const tHi = await wikiFindTitle(q, "hi", signal);
  if (tHi) {
    const sum = await wikiSummary(tHi, "hi", signal);
    if (sum?.thumbnail?.source) return sum.thumbnail.source;
    if (sum?.originalimage?.source) return sum.originalimage.source;
  }

  // C) Wikimedia Commons
  const c = await commonsThumb(q, w, signal);
  if (c) return c;

  // D) Try shortened query (drop comma/dash)
  const short = q.split(",")[0].split(" - ")[0];
  if (short && short !== q) {
    const t2 = await wikiFindTitle(short, "en", signal);
    if (t2) {
      const s2 = await wikiSummary(t2, "en", signal);
      if (s2?.thumbnail?.source) return s2.thumbnail.source;
      if (s2?.originalimage?.source) return s2.originalimage.source;
    }
    const c2 = await commonsThumb(short, w, signal);
    if (c2) return c2;
  }

  // E) Openverse (broad web CC images)
  const ov = await openverseImage(q, signal);
  if (ov) return ov;

  // F) Last resort: seeded placeholder (never 404)
  return picsumSeed(w, h, q);
}

// ---------- Handler ----------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "travel").trim();
    const w = Math.max(200, Number(searchParams.get("w") || 800));
    const h = Math.max(150, Number(searchParams.get("h") || 600));

    const { signal, cleanup } = timeoutSignal(8000);
    const url = await resolveURL(q, w, h, signal);
    cleanup();

    // Always redirect to the resolved URL — most reliable for <img>
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    // Even if something fails, fail closed with a neutral placeholder so UI stays clean
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "travel").trim();
    const w = Math.max(200, Number(searchParams.get("w") || 800));
    const h = Math.max(150, Number(searchParams.get("h") || 600));
    const fallback = picsumSeed(w, h, q);
    return new Response(null, {
      status: 302,
      headers: {
        Location: fallback,
        "Cache-Control": "no-store",
      },
    });
  }
}
