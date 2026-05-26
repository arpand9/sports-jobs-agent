import Link from "next/link";
import { RoleNav } from "@/components/role-nav";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { getEmployerProfileById } from "@sportshire/services";
import { redirect } from "next/navigation";
import { getDemoEmployerId } from "@/lib/demo-session";

export default async function EmployerDashboardPage() {
  const employerId = await getDemoEmployerId();
  if (!employerId) redirect("/demo");

  const profile = await getEmployerProfileById(employerId);
  if (!profile) redirect("/demo");

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <RoleNav role="employer" active="/employer/dashboard" />
        <PageTitle
          eyebrow={profile.organizationName}
          title="your job postings"
          subtitle="open a role to see AI-ranked candidates — or post a new gig."
        />
        <Link href="/employer/jobs/new" className="btn-primary mb-8 inline-flex">
          + post new gig
        </Link>
        <div className="grid gap-4">
          {profile.jobPostings.map((job) => (
            <Link
              key={job.id}
              href={`/employer/jobs/${job.id}`}
              className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 hover:border-[var(--pink)]/40"
            >
              <div>
                <h3 className="font-display text-xl font-bold">{job.title}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {job.location} · {job.sport} · {job.status}
                </p>
              </div>
              <span className="text-sm font-bold text-[var(--pink)]">view matches →</span>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
