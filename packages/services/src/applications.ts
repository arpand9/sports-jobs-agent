import { MatchStatus, prisma } from "@sportshire/db";
import { paidRequired } from "@sportshire/shared";
import { matchCandidateToJob } from "./match";

export async function applyToJob(
  seekerId: string,
  jobId: string,
  options: { seekerPro: boolean }
) {
  if (!options.seekerPro) {
    return paidRequired(
      "seeker_apply_job",
      "Applying to jobs requires SportsHire Seeker Pro.",
      "Enable Seeker Pro in the demo at /demo or upgrade at sportshire.com/pricing."
    );
  }

  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  const seeker = await prisma.seekerProfile.findUnique({ where: { id: seekerId } });
  if (!job || !seeker) {
    return { ok: false as const, error: "Job or seeker not found" };
  }

  if (job.status !== "active") {
    return { ok: false as const, error: "This job is not accepting applications" };
  }

  const scored = await matchCandidateToJob(seekerId, jobId);
  if (!scored.ok) return scored;

  await prisma.matchResult.update({
    where: { jobId_seekerId: { jobId, seekerId } },
    data: { status: MatchStatus.seeker_interested },
  });

  return {
    ok: true as const,
    application: {
      seeker_id: seekerId,
      seeker_name: seeker.fullName,
      job_id: jobId,
      job_title: job.title,
      status: "seeker_interested",
      match_score: scored.totalScore,
    },
    message: "Application submitted. The employer can review your scored profile.",
  };
}
