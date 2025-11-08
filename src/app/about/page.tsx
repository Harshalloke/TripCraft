import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="relative text-white">
      {/* Background gradient for theme consistency */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(1000px 600px at 20% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(900px 500px at 100% 20%, rgba(168,85,247,0.12), transparent 60%)",
        }}
      />

      <section className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
        <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl p-8">
          <h1 className="text-3xl font-semibold md:text-4xl">About TripCraft</h1>
          <p className="mt-3 max-w-2xl text-white/85 text-sm md:text-base">
            TripCraft is your AI-powered travel planner that designs day-by-day itineraries,
            estimates your budget, and gives you direct Google links for hotels, restaurants, and
            attractions — all without using paid APIs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
            <h2 className="text-lg font-semibold mb-2">What We Do</h2>
            <ul className="list-disc list-inside text-sm text-white/85 space-y-1">
              <li>Generate AI itineraries tailored to your preferences.</li>
              <li>Provide live trip cost estimates in INR per person.</li>
              <li>Recommend hotels, restaurants, and experiences nearby.</li>
              <li>Offer quick Google links for directions and bookings.</li>
              <li>Support both domestic and international travel planning.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Our Vision</h2>
            <p className="text-sm text-white/85">
              We believe travel planning should be fast, smart, and transparent. TripCraft combines
              the power of AI and real-world data to give you beautiful, actionable travel plans in
              seconds — without hidden costs or complex tools.
            </p>

            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/85">
              <b>Privacy-first:</b> TripCraft never stores or sells your data. All plans are generated
              client-side using your Gemini API key.
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex flex-wrap justify-between items-center shadow-xl">
          <div>
            <h3 className="text-lg font-semibold">Start your next adventure</h3>
            <p className="text-sm text-white/80">
              Create a personalized itinerary in under a minute — no signup needed.
            </p>
          </div>
          <Link
            href="/plan"
            className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90"
          >
            Plan my trip
          </Link>
        </section>
      </section>
    </main>
  );
}
