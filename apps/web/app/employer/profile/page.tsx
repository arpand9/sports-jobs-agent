import { EmployerProfileForm } from "@/components/employer-profile-form";
import { RoleNav } from "@/components/role-nav";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { getEmployerProfileById } from "@sportshire/services";
import { redirect } from "next/navigation";
import { getDemoEmployerId } from "@/lib/demo-session";

export default async function EmployerProfilePage() {
  const employerId = await getDemoEmployerId();
  if (!employerId) redirect("/demo");

  const profile = await getEmployerProfileById(employerId);
  if (!profile) redirect("/demo");

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <RoleNav role="employer" active="/employer/profile" />
        <PageTitle
          eyebrow="hiring org"
          title="employer profile"
          subtitle="how candidates see your brand on SportsHire."
        />
        <EmployerProfileForm initial={profile} />
      </div>
    </SiteShell>
  );
}
