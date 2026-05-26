import { ProfileCompletenessWidget } from "@/components/profile-completeness-widget";
import { RoleNav } from "@/components/role-nav";
import { SeekerMatchList } from "@/components/seeker-match-list";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { findBestJobs, getSeekerProfileById } from "@sportshire/services";
import { redirect } from "next/navigation";
import { getDemoSeekerId } from "@/lib/demo-session";

export default async function SeekerDashboardPage() {
  const seekerId = await getDemoSeekerId();
  if (!seekerId) redirect("/demo");

  const profileResult = await getSeekerProfileById(seekerId);
  if (!profileResult) redirect("/demo");

  const matches = await findBestJobs({ seeker_id: seekerId, limit: 10, minimum_score: 0 });

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <RoleNav role="seeker" active="/seeker/dashboard" />
        <PageTitle
          eyebrow={`hey ${profileResult.data.fullName.split(" ")[0]}`}
          title="your best-fit gigs"
          subtitle="ranked live from employer scoring criteria — same engine as MCP find_best_jobs."
        />
        <div className="mb-8">
          <ProfileCompletenessWidget
            score={profileResult.completeness.score}
            items={profileResult.completeness.items}
          />
        </div>
        {matches.ok ? (
          <SeekerMatchList
            jobs={matches.jobs.map((j) => ({
              jobId: j.job_id,
              title: j.title,
              organization: j.organization,
              sport: j.sport,
              location: j.location,
              totalScore: j.total_score,
            }))}
          />
        ) : (
          <p className="text-[var(--pink)]">{matches.error}</p>
        )}
      </div>
    </SiteShell>
  );
}
