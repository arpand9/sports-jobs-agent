import { BackLink, PageTitle, SiteShell } from "@/components/site-shell";
import { getFeaturedNbaJob } from "@/lib/queries";

const DEMO_API_KEY = "sh_demo_sportshire_arpand9";

const FREE_TOOLS = [
  "search_jobs",
  "search_candidates",
  "find_best_jobs",
  "get_job_posting",
  "get_candidate_profile",
  "get_marketplace_stats",
];

const PRO_TOOLS = [
  { name: "apply_to_job", tier: "seeker", env: "SPORTSHIRE_SEEKER_PRO=1" },
  { name: "find_best_candidates", tier: "employer", env: "SPORTSHIRE_EMPLOYER_PRO=1" },
  { name: "match_candidate_to_job", tier: "employer", env: "SPORTSHIRE_EMPLOYER_PRO=1" },
  { name: "get_match_results (by job_id)", tier: "employer", env: "SPORTSHIRE_EMPLOYER_PRO=1" },
];

export default async function McpPage() {
  const featuredJob = await getFeaturedNbaJob();

  const cursorConfig = `{
  "mcpServers": {
    "sportshire": {
      "command": "npx",
      "args": ["tsx", "apps/mcp-server/src/index.ts"],
      "cwd": "/path/to/sports-jobs-agent",
      "env": {
        "DATABASE_URL": "postgresql://sportshire:sportshire@localhost:5432/sportshire",
        "SPORTSHIRE_API_KEY": "${DEMO_API_KEY}",
        "SPORTSHIRE_SEEKER_PRO": "0",
        "SPORTSHIRE_EMPLOYER_PRO": "0"
      }
    }
  }
}`;

  return (
    <SiteShell active="mcp">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <BackLink href="/" label="back to home" />
        <PageTitle
          eyebrow="agent mode"
          title="let your AI do the networking"
          subtitle="connect Cursor or Claude Desktop. your agent searches talent, ranks matches, and stays out of your DMs."
        />

        <section className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <span className="sticker sticker-lime">demo key</span>
            <span className="text-sm text-[var(--muted)]">copy paste don't gatekeep</span>
          </div>
          <code className="mono mt-4 block overflow-x-auto rounded-2xl border-2 border-black bg-black/50 p-4 text-sm text-[var(--lime)] shadow-[4px_4px_0_#000]">
            {DEMO_API_KEY}
          </code>
        </section>

        <section className="glass mt-5 rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">cursor config</h2>
          <pre className="mono mt-4 max-h-64 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-[var(--cyan)]">
            {cursorConfig}
          </pre>
        </section>

        <section className="glass mt-5 rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">agent playbook</h2>
          <ol className="mt-4 space-y-4">
            {[
              {
                step: "1",
                text: (
                  <>
                    call <code className="text-[var(--lime)]">search_jobs</code> — query
                    &quot;Sports Analytics Manager&quot;
                  </>
                ),
              },
              {
                step: "2",
                text: (
                  <>
                    call <code className="text-[var(--cyan)]">find_best_jobs</code> with{" "}
                    <code>seeker_name: &quot;Sarah Chen&quot;</code> — free tier, full scores
                  </>
                ),
              },
              {
                step: "2b",
                text: (
                  <>
                    set <code className="text-[var(--pink)]">SPORTSHIRE_EMPLOYER_PRO=1</code> then{" "}
                    <code>find_best_candidates</code>
                    {featuredJob ? (
                      <span className="mono block mt-1 text-xs text-white/50">
                        featured job_id: {featuredJob.id}
                      </span>
                    ) : null}
                  </>
                ),
              },
              {
                step: "3",
                text: (
                  <>
                    call <code className="text-[var(--pink)]">get_candidate_profile</code> on
                    #1 — main character unlocked
                  </>
                ),
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[var(--pink)] font-display font-bold shadow-[2px_2px_0_#000]">
                  {item.step}
                </span>
                <p className="pt-2 text-sm leading-relaxed text-[var(--muted)]">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="glass mt-5 rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">test in browser</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            run the same tools against your local DB without MCP —{" "}
            <a href="/playground" className="font-bold text-[var(--lime)] underline-offset-2 hover:underline">
              open live tools playground →
            </a>
          </p>
        </section>

        <section className="glass mt-5 rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">free vs pro tools</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Toggle Pro in the web demo at <a href="/demo" className="text-[var(--lime)] underline">/demo</a>{" "}
            or set env vars in MCP config.
          </p>
          <h3 className="mt-6 text-sm font-bold text-[var(--lime)]">Always free</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {FREE_TOOLS.map((tool) => (
              <li
                key={tool}
                className="mono rounded-xl border border-[var(--lime)]/30 bg-white/5 px-3 py-2 text-xs"
              >
                {tool}
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-bold text-[var(--pink)]">Pro (env flag)</h3>
          <ul className="mt-3 space-y-2">
            {PRO_TOOLS.map((tool) => (
              <li
                key={tool.name}
                className="mono rounded-xl border border-[var(--pink)]/30 bg-white/5 px-3 py-2 text-xs"
              >
                {tool.name}{" "}
                <span className="text-white/40">— {tool.env}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}
