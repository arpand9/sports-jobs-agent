import Link from "next/link";
import { BackLink, PageTitle, SiteShell } from "@/components/site-shell";
import { getActiveJobs } from "@/lib/queries";

const SPORT_EMOJI: Record<string, string> = {
  basketball: "🏀",
  football: "🏈",
  soccer: "⚽",
  baseball: "⚾",
  hockey: "🏒",
  esports: "🎮",
  golf: "⛳",
};

export default async function JobsPage() {
  const jobs = await getActiveJobs();

  return (
    <SiteShell active="jobs">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <BackLink href="/" label="back to home" />
        <PageTitle
          eyebrow="open roles"
          title="gigs that actually slap"
          subtitle="tap a role to see who's ranked — same energy as the MCP find_best_candidates tool."
        />

        <div className="grid gap-4">
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              href={`/employer/jobs/${job.id}`}
              className="glass group block rounded-3xl p-6 transition hover:-translate-y-1 hover:border-[var(--lime)]/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-white/10 text-2xl shadow-[3px_3px_0_#000]">
                    {SPORT_EMOJI[job.sport ?? ""] ?? "🏟️"}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold group-hover:text-[var(--lime)]">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                      {job.employer.organizationName} · {job.location}
                    </p>
                  </div>
                </div>
                <span
                  className={`sticker ${i % 2 === 0 ? "sticker-lime" : "sticker-cyan"} text-[10px]`}
                >
                  {job.jobType.replace("_", " ")}
                </span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/70">
                {job.description}
              </p>
              <p className="mt-4 text-sm font-bold text-[var(--pink)]">
                see match rankings →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
