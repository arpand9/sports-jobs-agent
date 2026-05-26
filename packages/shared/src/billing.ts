/** Feature gates for SportsHire freemium model (demo + production-shaped). */

export type BillingFeature =
  | "seeker_search_jobs"
  | "seeker_find_jobs"
  | "seeker_apply_job"
  | "employer_post_job"
  | "employer_match_scores";

export const SEEKER_FREE_FEATURES: BillingFeature[] = [
  "seeker_search_jobs",
  "seeker_find_jobs",
];

export const SEEKER_PRO_FEATURES: BillingFeature[] = ["seeker_apply_job"];

export const EMPLOYER_FREE_FEATURES: BillingFeature[] = ["employer_post_job"];

export const EMPLOYER_PRO_FEATURES: BillingFeature[] = ["employer_match_scores"];

export interface PaidRequiredError {
  ok: false;
  error: "paid_plan_required";
  feature: BillingFeature;
  message: string;
  upgrade_hint: string;
}

export function paidRequired(
  feature: BillingFeature,
  message: string,
  upgradeHint = "Upgrade to SportsHire Pro to unlock this action."
): PaidRequiredError {
  return {
    ok: false,
    error: "paid_plan_required",
    feature,
    message,
    upgrade_hint: upgradeHint,
  };
}

export const PRICING_COPY = {
  seeker: {
    free: ["Search jobs via MCP & web", "AI-ranked best-fit list (find_best_jobs)", "Structured profile"],
    pro: ["Apply to jobs through the platform", "Application tracked in match pipeline"],
  },
  employer: {
    free: ["Post unlimited jobs", "Weighted scoring criteria on each role"],
    pro: [
      "AI-ranked candidate roster",
      "Per-criterion score breakdown",
      "MCP find_best_candidates",
    ],
  },
} as const;
