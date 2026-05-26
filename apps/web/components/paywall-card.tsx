import Link from "next/link";
import type { BillingFeature } from "@sportshire/shared";

export function PaywallCard({
  feature,
  title,
  description,
  ctaHref = "/demo",
  ctaLabel = "unlock in demo →",
}: {
  feature: BillingFeature;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div
      className="glass relative overflow-hidden rounded-3xl border border-[var(--pink)]/40 p-8"
      data-feature={feature}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--pink)] opacity-20 blur-3xl" />
      <span className="sticker sticker-pink">pro only</span>
      <h3 className="font-display mt-4 text-2xl font-extrabold">{title}</h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      <Link href={ctaHref} className="btn-primary mt-6 inline-flex">
        {ctaLabel}
      </Link>
    </div>
  );
}
