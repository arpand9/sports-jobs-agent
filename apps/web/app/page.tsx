import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getMarketplaceStats } from "@/lib/queries";
import { PRICING_COPY } from "@sportshire/shared";

export default async function HomePage() {
  const stats = await getMarketplaceStats();

  const statCards = [
    { label: "talent in the pool", value: stats.total_seekers, emoji: "🧢", color: "var(--lime)" },
    { label: "open gigs", value: stats.active_jobs, emoji: "📋", color: "var(--cyan)" },
    { label: "matches made", value: stats.total_matches, emoji: "💫", color: "var(--pink)" },
    { label: "sports covered", value: stats.jobs_by_sport.length, emoji: "🏟️", color: "var(--purple)" },
  ];

  return (
    <SiteShell active="home">
      <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-8 pt-12 md:pt-20">
        <div className="glow-orb pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--pink)] opacity-30 blur-[80px]" />
        <div className="glow-orb pointer-events-none absolute right-0 top-32 h-48 w-48 rounded-full bg-[var(--cyan)] opacity-25 blur-[60px]" />

        <div className="relative flex flex-wrap gap-2">
          <span className="sticker sticker-lime">sports hack 2026</span>
          <span className="sticker sticker-cyan">mcp-native</span>
          <span className="sticker sticker-pink">no cap structured data</span>
        </div>

        <h1 className="font-display mt-8 max-w-4xl text-5xl font-extrabold leading-[0.95] md:text-7xl">
          land your{" "}
          <span className="gradient-text">dream sports gig</span>
          <br />
          <span className="text-white/90">before the group chat does</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          profiles your AI agent actually understands. employers set the vibe check
          (weighted criteria). agents search and rank via MCP for free — you pay when
          it&apos;s time to apply or review scored candidates.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/demo" className="btn-primary">
            start demo →
          </Link>
          <Link href="/seeker/dashboard" className="btn-ghost">
            seeker dashboard
          </Link>
          <Link href="/employer/dashboard" className="btn-ghost">
            employer dashboard
          </Link>
        </div>

        <div className="floaty mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="glass rounded-2xl p-5 transition hover:-translate-y-1"
              style={{ borderColor: `${card.color}33` }}
            >
              <div className="text-2xl">{card.emoji}</div>
              <div
                className="mono mt-3 font-display text-4xl font-extrabold"
                style={{ color: card.color }}
              >
                {card.value}
              </div>
              <div className="mt-1 text-sm font-medium text-[var(--muted)]">{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16" id="pricing">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">
          free to discover. <span className="gradient-text">pro to close</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Built for AI agents first: MCP search and ranking stay free. Revenue kicks in
          when seekers apply and employers review match intelligence.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-3xl p-8">
            <span className="sticker sticker-lime">seekers</span>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold">Free</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {PRICING_COPY.seeker.free.map((line) => (
                    <li key={line}>✓ {line}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--lime)]/30 bg-[var(--lime)]/5 p-4">
                <h3 className="font-display text-lg font-bold text-[var(--lime)]">Pro</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {PRICING_COPY.seeker.pro.map((line) => (
                    <li key={line}>★ {line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="glass rounded-3xl p-8">
            <span className="sticker sticker-pink">employers</span>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold">Free</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {PRICING_COPY.employer.free.map((line) => (
                    <li key={line}>✓ {line}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--pink)]/30 bg-[var(--pink)]/5 p-4">
                <h3 className="font-display text-lg font-bold text-[var(--pink)]">Pro</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {PRICING_COPY.employer.pro.map((line) => (
                    <li key={line}>★ {line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Hackathon demo? Toggle Pro tiers at{" "}
          <Link href="/demo" className="text-[var(--cyan)] underline">
            /demo
          </Link>{" "}
          — no Stripe required.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">
          how it hits <span className="gradient-text">different</span>
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "for you",
              body: "build a structured profile — skills, sports, experience — not a PDF black hole.",
              emoji: "🙋",
            },
            {
              title: "for hiring teams",
              body: "post gigs with weighted scoring. you decide what matters. we rank the roster.",
              emoji: "🏢",
            },
            {
              title: "for AI agents",
              body: "9 MCP tools. search, match, rank. your cursor agent can recruit while you snack.",
              emoji: "⚡",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-3xl p-6">
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="font-display mt-4 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
