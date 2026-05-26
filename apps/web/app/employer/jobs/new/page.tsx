import { EmployerJobForm } from "@/components/employer-job-form";
import { RoleNav } from "@/components/role-nav";
import { PageTitle, SiteShell } from "@/components/site-shell";

export default function NewJobPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <RoleNav role="employer" active="/employer/jobs/new" />
        <PageTitle
          eyebrow="new posting"
          title="post a gig with weighted criteria"
          subtitle="sliders must sum to 100% — agents & seekers use the same scoring engine."
        />
        <EmployerJobForm />
      </div>
    </SiteShell>
  );
}
