import { JobStatus, prisma } from "@sportshire/db";
import {
  parseScoringCriteria,
  rankSeekersForJob,
  toSeekerProfileData,
} from "@sportshire/shared";

export async function getMarketplaceStats() {
  const [seekers, jobs, matches, activeJobs] = await Promise.all([
    prisma.seekerProfile.count({ where: { isSearchable: true } }),
    prisma.jobPosting.count(),
    prisma.matchResult.count(),
    prisma.jobPosting.count({ where: { status: JobStatus.active } }),
  ]);

  const jobsBySport = await prisma.jobPosting.groupBy({
    by: ["sport"],
    _count: true,
    where: { status: JobStatus.active },
  });

  return {
    total_seekers: seekers,
    total_jobs: jobs,
    active_jobs: activeJobs,
    total_matches: matches,
    jobs_by_sport: jobsBySport.map((g) => ({
      sport: g.sport ?? "unknown",
      count: g._count,
    })),
  };
}

export async function getActiveJobs() {
  return prisma.jobPosting.findMany({
    where: { status: JobStatus.active },
    include: { employer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getJobWithMatches(jobId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { employer: true },
  });
  if (!job) return null;

  const criteria = parseScoringCriteria(job.scoringCriteria);
  const seekers = await prisma.seekerProfile.findMany({ where: { isSearchable: true } });
  const ranked = rankSeekersForJob(
    seekers.map((s) => toSeekerProfileData(s)),
    criteria,
    { minimumScore: 40, limit: 10 }
  );

  return { job, ranked };
}

export async function getFeaturedNbaJob() {
  const job = await prisma.jobPosting.findFirst({
    where: {
      status: JobStatus.active,
      title: { contains: "Sports Analytics Manager" },
    },
  });
  return job;
}
