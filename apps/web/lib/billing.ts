import { cookies } from "next/headers";
import type { BillingFeature } from "@sportshire/shared";

export const SEEKER_PRO_COOKIE = "sportshire_seeker_pro";
export const EMPLOYER_PRO_COOKIE = "sportshire_employer_pro";

/** Demo: treat env as pro for local dev override */
export async function hasSeekerPro(): Promise<boolean> {
  if (process.env.SPORTSHIRE_SEEKER_PRO === "1") return true;
  const jar = await cookies();
  return jar.get(SEEKER_PRO_COOKIE)?.value === "1";
}

export async function hasEmployerPro(): Promise<boolean> {
  if (process.env.SPORTSHIRE_EMPLOYER_PRO === "1") return true;
  const jar = await cookies();
  return jar.get(EMPLOYER_PRO_COOKIE)?.value === "1";
}

export async function canUseFeature(feature: BillingFeature): Promise<boolean> {
  switch (feature) {
    case "seeker_search_jobs":
    case "seeker_find_jobs":
      return true;
    case "seeker_apply_job":
      return hasSeekerPro();
    case "employer_post_job":
      return true;
    case "employer_match_scores":
      return hasEmployerPro();
    default:
      return false;
  }
}
