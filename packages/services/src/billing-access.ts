import { paidRequired, type BillingFeature } from "@sportshire/shared";
import { findBestCandidates as findBestCandidatesCore, getMatchResults } from "./match";

export async function findBestCandidatesGated(
  args: Parameters<typeof findBestCandidatesCore>[0] & { employerPro: boolean }
) {
  if (!args.employerPro) {
    const preview = await findBestCandidatesCore({
      ...args,
      limit: 3,
      minimum_score: 0,
      persist: false,
    });

    if (!preview.ok) return preview;

    return {
      ok: true as const,
      tier: "free" as const,
      job_id: preview.job_id,
      job_title: preview.job_title,
      preview_count: preview.candidates.length,
      message:
        "Free tier: candidate names hidden. Upgrade to Employer Pro for full match scores and breakdowns.",
      candidates: preview.candidates.map((c) => ({
        seeker_id: "***",
        full_name: "Pro unlock",
        headline: "Upgrade to see ranked candidates",
        total_score: null,
        score_breakdown: null,
      })),
      upgrade_required_for: "employer_match_scores" as BillingFeature,
    };
  }

  const result = await findBestCandidatesCore(args);
  if (!result.ok) return result;
  return { ...result, tier: "pro" as const };
}

export function gateEmployerMatchScores(employerPro: boolean) {
  if (!employerPro) {
    return paidRequired(
      "employer_match_scores",
      "Viewing AI match scores and ranked candidates requires Employer Pro.",
      "Enable Employer Pro in the demo at /demo."
    );
  }
  return null;
}

export function gateSeekerApply(seekerPro: boolean) {
  if (!seekerPro) {
    return paidRequired(
      "seeker_apply_job",
      "Applying to jobs requires Seeker Pro.",
      "Enable Seeker Pro in the demo at /demo."
    );
  }
  return null;
}

export async function getMatchResultsGated(
  args: Parameters<typeof getMatchResults>[0] & { employerPro: boolean }
) {
  const { employerPro, ...query } = args;

  if (query.job_id && !employerPro) {
    return gateEmployerMatchScores(false);
  }

  return getMatchResults(query);
}
