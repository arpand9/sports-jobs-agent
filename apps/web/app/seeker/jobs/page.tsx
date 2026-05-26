import { JobSearchPanel } from "@/components/job-search-panel";
import { RoleNav } from "@/components/role-nav";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { getActiveJobs } from "@/lib/queries";

export default async function SeekerJobsPage() {
  const jobs = await getActiveJobs();

  return (
    <SiteShell active="jobs">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <RoleNav role="seeker" active="/seeker/jobs" />
        <PageTitle
          eyebrow="job search"
          title="find gigs with filters"
          subtitle="sport, type, remote — then open a role to see how you rank."
        />
        <JobSearchPanel jobs={jobs} />
      </div>
    </SiteShell>
  );
}
