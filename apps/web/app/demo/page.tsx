import { BillingDemoToggles } from "@/components/billing-demo-toggles";
import { DemoPersonaPicker } from "@/components/demo-persona-picker";
import { PageTitle, SiteShell } from "@/components/site-shell";
import { hasEmployerPro, hasSeekerPro } from "@/lib/billing";
import {
  getDemoEmployerId,
  getDemoSeekerId,
  listDemoPersonas,
} from "@/lib/demo-session";
import { PRICING_COPY } from "@sportshire/shared";

export default async function DemoPage() {
  const [{ seekers, employers }, seekerId, employerId, seekerPro, employerPro] =
    await Promise.all([
      listDemoPersonas(),
      getDemoSeekerId(),
      getDemoEmployerId(),
      hasSeekerPro(),
      hasEmployerPro(),
    ]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <PageTitle
          eyebrow="demo mode"
          title="pick your persona"
          subtitle="no login required for the hackathon demo — cookies remember seeker + employer."
        />
        <DemoPersonaPicker
          seekers={seekers}
          employers={employers}
          currentSeekerId={seekerId}
          currentEmployerId={employerId}
        />
        <BillingDemoToggles seekerPro={seekerPro} employerPro={employerPro} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display font-bold text-[var(--lime)]">Seeker</h3>
            <p className="mt-1 text-xs font-bold uppercase text-white/50">Free</p>
            <ul className="mt-3 list-inside list-disc text-sm text-[var(--muted)]">
              {PRICING_COPY.seeker.free.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-bold uppercase text-[var(--pink)]">Pro</p>
            <ul className="mt-2 list-inside list-disc text-sm text-[var(--muted)]">
              {PRICING_COPY.seeker.pro.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display font-bold text-[var(--pink)]">Employer</h3>
            <p className="mt-1 text-xs font-bold uppercase text-white/50">Free</p>
            <ul className="mt-3 list-inside list-disc text-sm text-[var(--muted)]">
              {PRICING_COPY.employer.free.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-bold uppercase text-[var(--cyan)]">Pro</p>
            <ul className="mt-2 list-inside list-disc text-sm text-[var(--muted)]">
              {PRICING_COPY.employer.pro.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a href="/seeker/dashboard" className="glass rounded-3xl p-6 hover:border-[var(--lime)]">
            <h3 className="font-display font-bold">seeker flow →</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">profile, matches, job search</p>
          </a>
          <a href="/employer/dashboard" className="glass rounded-3xl p-6 hover:border-[var(--pink)]">
            <h3 className="font-display font-bold">employer flow →</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">post jobs, rank candidates</p>
          </a>
        </div>
      </div>
    </SiteShell>
  );
}
