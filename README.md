# TripCraft — AI Travel Planner

Plan smarter trips with **Gemini**: day-by-day itineraries, costs, packing list, and direct **Google** links (Hotels, Restaurants, Attractions, Flights). No paid APIs.

## ✨ Features

- 🔮 **AI itineraries** tailored to dates, group size, interests, and pace  
- 💰 **Cost breakdown** with per-person estimate (INR-ready)  
- 🗺️ **Direct Google links** for hotels, food, attractions, flights & driving directions  
- 🧳 **Packing list** + AI tips  
- 🧼 **Glassmorphism UI** with professional typography  
- 🔒 **Privacy-first:** only your Gemini key, no paid services

## 🧱 Tech Stack

- **Next.js (App Router)** + React
- **Tailwind CSS**
- **Client-side Gemini API** (via `/api/ai/plan`)
- No server DB required

## 🖥️ Local Setup

```bash
git clone https://github.com/<your-username>/tripcraft.git
cd tripcraft
npm install

Create a .env.local:
GEMINI_API_KEY=your_gemini_key_here

Run dev:
npm run dev

Build & preview:
npm run build
npm start


🔑 Environment Variables
Key	Required	Description
GEMINI_API_KEY	✅	Your Google Gemini API key

Never commit .env* files.


📁 Project Structure

app/
  layout.tsx           # Root layout (server)
  page.tsx             # Landing page (slideshow hero)
  plan/page.tsx        # Planner (form + Gemini call)
  trip/[id]/page.tsx   # Itinerary, costs, quick links
  about/page.tsx       # About (glass UI)
  contact/page.tsx     # Contact (mailto)
components/
  Header.tsx           # Sticky glass header (client)
  PeopleBudgetForm.tsx # Form with steppers + dropdown
  CostSummary.tsx      # Cost breakdown widget
lib/
  deeplinks.ts         # Google links helpers
  costs.ts             # INR estimates
  store.ts             # Zustand store for trip data
  types.ts             # TypeScript types
public/
  # Optional images if you want local assets


🚀 Deploy
Vercel (recommended)

Push to GitHub

Import the repo in Vercel

Add GEMINI_API_KEY in Project → Settings → Environment Variables

Deploy

CLI

npm i -g vercel
vercel
vercel --prod


🔧 Scripts

dev — start dev server

build — production build

start — run production server

🧰 Notes

If you removed all image fetching, you can delete any /api/place-photo route.

For dropdowns on dark UI, ensure <option class="text-black"> to prevent white-on-white menus (Chrome/Edge).

Printing: we include print styles to keep contrast when exporting to PDF.

🛡️ License

MIT © 2025 TripCraft

---

If you want, I can also add a `.env.example`, a GitHub Actions workflow for automatic lint/build, or a custom domain setup for Vercel.
::contentReference[oaicite:0]{index=0}
