import { SeekerProfileBuilder } from "@/components/seeker-profile-builder";
import { RoleNav } from "@/components/role-nav";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { getSeekerProfileById } from "@sportshire/services";
import { redirect } from "next/navigation";
import { getDemoSeekerId } from "@/lib/demo-session";

export default async function SeekerProfilePage() {
  const seekerId = await getDemoSeekerId();
  if (!seekerId) redirect("/demo");

  const result = await getSeekerProfileById(seekerId);
  if (!result) redirect("/demo");

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <RoleNav role="seeker" active="/seeker/profile" />
        <PageTitle
          eyebrow="structured profile"
          title="build your agent-readable resume"
          subtitle="every field maps to JSON your AI recruiter can search & match."
        />
        <SeekerProfileBuilder
          initial={result.data}
          initialCompleteness={result.completeness}
        />
      </div>
    </SiteShell>
  );
}
