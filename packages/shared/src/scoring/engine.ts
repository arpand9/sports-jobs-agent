import type {
  MatchScoreResult,
  ScoringCriteriaDocument,
  SeekerProfileData,
} from "../types";
import {
  scoreEducationMatch,
  scoreExactMatch,
  scoreRangeMatch,
  scoreSemanticMatch,
  scoreSkillMatch,
} from "./criteria";

function evaluateCriterion(
  seeker: SeekerProfileData,
  criterion: ScoringCriteriaDocument["criteria"][number]
): { score: number; details: string } {
  switch (criterion.type) {
    case "skill_match":
      return scoreSkillMatch(seeker, criterion.config);
    case "range_match":
      return scoreRangeMatch(seeker, criterion.config);
    case "exact_match":
      return scoreExactMatch(seeker, criterion.config);
    case "education_match":
      return scoreEducationMatch(seeker, criterion.config);
    case "semantic_match":
      return scoreSemanticMatch(seeker, criterion.config);
    default:
      return { score: 0, details: "Unknown criterion type" };
  }
}

export function scoreSeekerAgainstJob(
  seeker: SeekerProfileData,
  criteriaDoc: ScoringCriteriaDocument
): MatchScoreResult {
  const scoreBreakdown: MatchScoreResult["scoreBreakdown"] = {};
  let totalScore = 0;

  for (const criterion of criteriaDoc.criteria) {
    const { score, details } = evaluateCriterion(seeker, criterion);
    const weightedScore = (score * criterion.weight) / 100;
    totalScore += weightedScore;
    scoreBreakdown[criterion.name] = {
      score: Math.round(score * 10) / 10,
      weight: criterion.weight,
      weightedScore: Math.round(weightedScore * 10) / 10,
      details,
    };
  }

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    scoreBreakdown,
  };
}

export function rankSeekersForJob(
  seekers: SeekerProfileData[],
  criteriaDoc: ScoringCriteriaDocument,
  options?: { minimumScore?: number; limit?: number }
): Array<SeekerProfileData & MatchScoreResult> {
  const minimumScore = options?.minimumScore ?? 0;
  const limit = options?.limit ?? 10;

  return seekers
    .map((seeker) => ({
      ...seeker,
      ...scoreSeekerAgainstJob(seeker, criteriaDoc),
    }))
    .filter((r) => r.totalScore >= minimumScore)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
}

export function rankJobsForSeeker(
  seeker: SeekerProfileData,
  jobs: Array<{ id: string; title: string; criteria: ScoringCriteriaDocument }>,
  options?: { minimumScore?: number; limit?: number }
): Array<{ jobId: string; title: string } & MatchScoreResult> {
  const minimumScore = options?.minimumScore ?? 0;
  const limit = options?.limit ?? 10;

  return jobs
    .map((job) => ({
      jobId: job.id,
      title: job.title,
      ...scoreSeekerAgainstJob(seeker, job.criteria),
    }))
    .filter((r) => r.totalScore >= minimumScore)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
}
