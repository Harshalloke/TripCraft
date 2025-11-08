
# 🌍 TripCraft — AI Travel Planner [Live Demo("https://trip-craft-five.vercel.app/")]

Plan smarter trips with **Gemini AI**.  
Get day-by-day itineraries, cost estimates, AI travel tips, and direct **Google links** — all without paid APIs.

---

## ✨ Features

- 🤖 **AI-powered itineraries** – generated with Gemini  
- 💸 **Smart budget planning** – estimated total & per-person cost  
- 🗺️ **Direct Google links** – Hotels, Restaurants, Attractions & Flights  
- 🧳 **Auto packing list** + AI weather & safety tips  
- 🧊 **Beautiful glassmorphism UI** – professional gradient theme  
- 🔒 **Privacy-first** – no account, no paid APIs, only your Gemini key  

---

## 🧱 Tech Stack

- **Next.js 14 (App Router)**
- **React 18**
- **Tailwind CSS**
- **Zustand** for state management
- **Gemini API** (via `/api/ai/plan`)

---

## ⚙️ Local Setup

```bash
# Clone repo
git clone https://github.com/<your-username>/tripcraft.git
cd tripcraft

# Install dependencies
npm install
````

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Then run locally:

```bash
npm run dev
```

Visit: **[http://localhost:3000](http://localhost:3000)**

To build for production:

```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

| Key              | Required | Description                                 |
| ---------------- | -------- | ------------------------------------------- |
| `GEMINI_API_KEY` | ✅        | Your Gemini API key (from Google AI Studio) |

---

## 📂 Project Structure

```
tripcraft/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── plan/page.tsx        # Planner (form + Gemini call)
│   ├── trip/[id]/page.tsx   # Generated itinerary page
│   ├── about/page.tsx       # About section
│   └── contact/page.tsx     # Contact form
│
├── components/
│   ├── Header.tsx
│   ├── PeopleBudgetForm.tsx
│   ├── CostSummary.tsx
│   └── ...
│
├── lib/
│   ├── deeplinks.ts         # Google Maps & Travel URLs
│   ├── costs.ts             # INR cost estimator
│   ├── store.ts             # Zustand store
│   └── types.ts             # Shared types
│
├── public/
│   └── (optional images)
│
└── README.md
```

---

## 🚀 Deployment

### ▶️ **Vercel (recommended)**

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repo
4. Add Environment Variable:

   * `GEMINI_API_KEY = your_key_here`
5. Click **Deploy** 🎉

### ⚙️ Vercel CLI (optional)

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

---

## 🧾 Example Usage

1. Go to `/plan`
2. Enter origin, destination, travel dates, and budget
3. AI generates a full trip itinerary
4. Get direct Google links to:

   * 🏨 Hotels
   * 🍽️ Restaurants
   * 🎢 Attractions
   * ✈️ Flights
   * 🚗 Driving directions
5. Copy or export your trip plan as PDF

---

## 💡 Tips

* For dark dropdown menus, all `<option>` tags include `class="text-black"` for readability
* You can export trips to PDF using the “Print / PDF” button
* No data is stored on any server — fully client-side

---

## 🛡️ License

**MIT License** © 2025 [TripCraft](https://github.com/<your-username>/tripcraft)

---

## 🧭 Author

Built with ❤️ by **Harshal Loke**
🌐 [GitHub](https://github.com/Harshalloke)

```

---

✅ Just copy everything above ⬆️ into your **`README.md`** file.  
When you push this to GitHub, it will render perfectly with emojis, tables, and syntax-highlighted code.  

Would you like me to include **badges** (like “Built with Next.js” and “Deployed on Vercel”)? They make your GitHub page look more professional.
```
