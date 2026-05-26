import { findBestCandidatesGated } from "@sportshire/services";
import { notFound, redirect } from "next/navigation";
import { ApplyJobButton } from "@/components/apply-job-button";
import { MatchScoreCard } from "@/components/match-score-card";
import { PaywallCard } from "@/components/paywall-card";
import { RoleNav } from "@/components/role-nav";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { hasEmployerPro, hasSeekerPro } from "@/lib/billing";
import { getDemoEmployerId } from "@/lib/demo-session";
import { prisma } from "@sportshire/db";
import { toSeekerProfileData } from "@sportshire/shared";

const WEIGHT_COLORS = ["#b8ff3c", "#00e5ff", "#ff2d92", "#a855f7", "#fbbf24"];

export default async function EmployerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { employer: true },
  });
  if (!job) notFound();

  const employerId = await getDemoEmployerId();
  if (!employerId) redirect("/demo");

  const [employerPro, seekerPro] = await Promise.all([hasEmployerPro(), hasSeekerPro()]);
  const matchResult = await findBestCandidatesGated({
    job_id: id,
    limit: 10,
    minimum_score: 0,
    employerPro,
  });

  const ranked =
    matchResult.ok && matchResult.tier === "pro" && "candidates" in matchResult
      ? await Promise.all(
          matchResult.candidates.map(async (c) => {
            const seeker = await prisma.seekerProfile.findUnique({
              where: { id: c.seeker_id },
            });
            if (!seeker) return null;
            return {
              ...toSeekerProfileData(seeker),
              totalScore: c.total_score ?? 0,
              scoreBreakdown: c.score_breakdown,
            };
          })
        ).then((rows) => rows.filter(Boolean) as NonNullable<(typeof rows)[number]>[])
      : [];

  const previewCount =
    matchResult.ok && matchResult.tier === "free" && "preview_count" in matchResult
      ? matchResult.preview_count
      : 0;

  const criteria = (job.scoringCriteria as { criteria: Array<{ name: string; weight: number }> })
    .criteria;

  return (
    <SiteShell active="jobs">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <RoleNav role="employer" active="/employer/dashboard" />

        <div className="glass mt-6 rounded-3xl p-8">
          <span className="sticker sticker-pink">{job.employer.organizationName}</span>
          <h1 className="font-display mt-4 text-4xl font-extrabold">{job.title}</h1>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">{job.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[job.location, job.sport, job.remoteOption.replace("_", " ")].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold">
              employer vibe check <span className="text-[var(--muted)]">(weights)</span>
            </h2>
            <div className="mt-4 space-y-3">
              {criteria.map((c, i) => (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm font-semibold">
                    <span className="capitalize text-[var(--muted)]">
                      {c.name.replace(/_/g, " ")}
                    </span>
                    <span className="mono" style={{ color: WEIGHT_COLORS[i % WEIGHT_COLORS.length] }}>
                      {c.weight}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.weight}%`,
                        background: WEIGHT_COLORS[i % WEIGHT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PageTitle
          eyebrow="ranked roster"
          title="who's actually a fit"
          subtitle={
            employerPro
              ? "scored by the same engine your AI agent calls via find_best_candidates."
              : "posting is free — unlock AI match scores with Employer Pro."
          }
        />

        {employerPro ? (
          <div className="grid gap-5">
            {ranked.map((candidate, index) => (
              <MatchScoreCard key={candidate.id} rank={index + 1} candidate={candidate} />
            ))}
          </div>
        ) : (
          <PaywallCard
            feature="employer_match_scores"
            title={`${previewCount || "Several"} candidates match this role`}
            description="Free tier lets you post and set scoring criteria. Employer Pro reveals names, composite scores, and per-criterion breakdowns — same data as MCP find_best_candidates."
            ctaHref="/demo"
            ctaLabel="enable employer pro in demo →"
          />
        )}

        <ApplyJobButton jobId={id} jobTitle={job.title} seekerPro={seekerPro} />
      </div>
    </SiteShell>
  );
}
