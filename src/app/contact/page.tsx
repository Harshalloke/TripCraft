"use client";

import { useMemo, useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<"support" | "feedback" | "partnership">("feedback");
  const [message, setMessage] = useState("");
  const valid = name.trim() && email.trim() && message.trim();

  const mailtoHref = useMemo(() => {
    const to = "hello@tripcraft.app";
    const subject = `[TripCraft] ${topic[0].toUpperCase() + topic.slice(1)} from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [name, email, topic, message]);

  const submit = () => (window.location.href = mailtoHref);

  return (
    <main className="relative text-white">
      {/* Gradient background same as other pages */}
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
          <h1 className="text-3xl font-semibold md:text-4xl">Contact Us</h1>
          <p className="mt-3 max-w-2xl text-white/85 text-sm md:text-base">
            Have feedback, suggestions, or partnership ideas? We’d love to hear from you.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-5">
          {/* Form */}
          <div className="md:col-span-3 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl p-6">
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Your Name</label>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Topic</label>
                <select
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as any)}
                >
                  <option className="text-black" value="feedback">Feedback</option>
                  <option className="text-black" value="support">Support</option>
                  <option className="text-black" value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Message</label>
                <textarea
                  rows={6}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
                  placeholder="Tell us how we can help…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-white/70">Uses your email app, no server required.</p>
                <button
                  onClick={submit}
                  disabled={!valid}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <aside className="md:col-span-2 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl p-6 text-sm text-white/85">
            <div className="font-semibold text-base mb-2">Other ways to reach us</div>
            <ul className="space-y-2">
              <li>
                Email:{" "}
                <a href="mailto:hello@tripcraft.app" className="underline hover:text-white">
                  hello@tripcraft.app
                </a>
              </li>
              <li>
                Twitter / X:{" "}
                <a href="https://twitter.com" target="_blank" className="underline hover:text-white">
                  @tripcraft
                </a>
              </li>
              <li>
                GitHub:{" "}
                <a href="https://github.com" target="_blank" className="underline hover:text-white">
                  tripcraft
                </a>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="font-medium">Support Hours</div>
              <p className="text-white/80 text-sm">Mon–Fri, 10:00–18:00 IST</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="font-medium">Status</div>
              <p className="text-white/80 text-sm">All systems operational ✅</p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
