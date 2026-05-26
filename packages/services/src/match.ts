import { JobStatus, prisma, type Prisma } from "@sportshire/db";
import {
  parseScoringCriteria,
  rankJobsForSeeker,
  rankSeekersForJob,
  scoreSeekerAgainstJob,
  toSeekerProfileData,
} from "@sportshire/shared";
import { resolveJobId, resolveSeekerId } from "./lookup";
import { clampLimit } from "./text-search";

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function persistMatchResults(
  jobId: string,
  ranked: Array<{ seekerId: string; totalScore: number; scoreBreakdown: unknown }>
) {
  for (const row of ranked) {
    await prisma.matchResult.upsert({
      where: {
        jobId_seekerId: { jobId, seekerId: row.seekerId },
      },
      create: {
        jobId,
        seekerId: row.seekerId,
        totalScore: row.totalScore,
        scoreBreakdown: asJson(row.scoreBreakdown),
      },
      update: {
        totalScore: row.totalScore,
        scoreBreakdown: asJson(row.scoreBreakdown),
        matchedAt: new Date(),
      },
    });
  }
}

export async function getCandidateProfile(seekerId: string) {
  const seeker = await prisma.seekerProfile.findUnique({ where: { id: seekerId } });
  if (!seeker) return { ok: false as const, error: `Seeker not found: ${seekerId}` };
  return { ok: true as const, profile: toSeekerProfileData(seeker) };
}

export async function getJobPosting(jobId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { employer: true },
  });
  if (!job) return { ok: false as const, error: `Job not found: ${jobId}` };
  return {
    ok: true as const,
    job: {
      job_id: job.id,
      title: job.title,
      description: job.description,
      organization: job.employer.organizationName,
      org_type: job.employer.orgType,
      sport: job.sport,
      location: job.location,
      job_type: job.jobType,
      remote_option: job.remoteOption,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      scoring_criteria: job.scoringCriteria,
    },
  };
}

export async function matchCandidateToJob(seekerId: string, jobId: string) {
  const seeker = await prisma.seekerProfile.findUnique({ where: { id: seekerId } });
  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!seeker || !job) {
    return {
      ok: false as const,
      error: !seeker ? `Seeker not found: ${seekerId}` : `Job not found: ${jobId}`,
    };
  }

  const criteria = parseScoringCriteria(job.scoringCriteria);
  const result = scoreSeekerAgainstJob(toSeekerProfileData(seeker), criteria);

  await prisma.matchResult.upsert({
    where: { jobId_seekerId: { jobId, seekerId } },
    create: {
      jobId,
      seekerId,
      totalScore: result.totalScore,
      scoreBreakdown: asJson(result.scoreBreakdown),
    },
    update: {
      totalScore: result.totalScore,
      scoreBreakdown: asJson(result.scoreBreakdown),
    },
  });

  return {
    ok: true as const,
    seeker_id: seekerId,
    job_id: jobId,
    seeker_name: seeker.fullName,
    job_title: job.title,
    ...result,
  };
}

export async function findBestCandidates(args: {
  job_id?: string;
  job_title?: string;
  organization?: string;
  limit?: number;
  minimum_score?: number;
  persist?: boolean;
}) {
  const resolved = await resolveJobId({
    job_id: args.job_id,
    job_title: args.job_title,
    organization: args.organization,
  });
  if ("error" in resolved) return { ok: false as const, error: resolved.error };

  const job = await prisma.jobPosting.findUnique({
    where: { id: resolved.job_id },
    include: { employer: true },
  });
  if (!job) return { ok: false as const, error: "Job disappeared after resolve" };

  const criteria = parseScoringCriteria(job.scoringCriteria);
  const seekers = await prisma.seekerProfile.findMany({ where: { isSearchable: true } });
  const minimumScore = args.minimum_score ?? 0;
  const ranked = rankSeekersForJob(
    seekers.map((s) => toSeekerProfileData(s)),
    criteria,
    {
      limit: clampLimit(args.limit, 50, 10),
      minimumScore,
    }
  );

  if (args.persist !== false) {
    await persistMatchResults(
      job.id,
      ranked.map((r) => ({
        seekerId: r.id,
        totalScore: r.totalScore,
        scoreBreakdown: r.scoreBreakdown,
      }))
    );
  }

  return {
    ok: true as const,
    job_id: job.id,
    job_title: job.title,
    organization: job.employer.organizationName,
    minimum_score: minimumScore,
    resolved_from: args.job_id ? "job_id" : "job_title",
    ...(resolved.note ? { resolve_note: resolved.note } : {}),
    candidates: ranked.map((r) => ({
      seeker_id: r.id,
      full_name: r.fullName,
      headline: r.headline,
      total_score: r.totalScore,
      score_breakdown: r.scoreBreakdown,
    })),
  };
}

export async function findBestJobs(args: {
  seeker_id?: string;
  seeker_name?: string;
  limit?: number;
  minimum_score?: number;
  persist?: boolean;
}) {
  const resolved = await resolveSeekerId({
    seeker_id: args.seeker_id,
    seeker_name: args.seeker_name,
  });
  if ("error" in resolved) return { ok: false as const, error: resolved.error };

  const seeker = await prisma.seekerProfile.findUnique({
    where: { id: resolved.seeker_id },
  });
  if (!seeker) return { ok: false as const, error: "Seeker disappeared after resolve" };

  const seekerData = toSeekerProfileData(seeker);
  const jobs = await prisma.jobPosting.findMany({
    where: { status: JobStatus.active },
    include: { employer: true },
  });

  const minimumScore = args.minimum_score ?? 0;
  const ranked = rankJobsForSeeker(
    seekerData,
    jobs.map((j) => ({
      id: j.id,
      title: j.title,
      criteria: parseScoringCriteria(j.scoringCriteria),
    })),
    {
      limit: clampLimit(args.limit, 50, 10),
      minimumScore,
    }
  );

  if (args.persist !== false) {
    for (const match of ranked) {
      await prisma.matchResult.upsert({
        where: {
          jobId_seekerId: { jobId: match.jobId, seekerId: seeker.id },
        },
        create: {
          jobId: match.jobId,
          seekerId: seeker.id,
          totalScore: match.totalScore,
          scoreBreakdown: asJson(match.scoreBreakdown),
        },
        update: {
          totalScore: match.totalScore,
          scoreBreakdown: asJson(match.scoreBreakdown),
        },
      });
    }
  }

  return {
    ok: true as const,
    seeker_id: seeker.id,
    seeker_name: seeker.fullName,
    minimum_score: minimumScore,
    resolved_from: args.seeker_id ? "seeker_id" : "seeker_name",
    ...(resolved.note ? { resolve_note: resolved.note } : {}),
    jobs: ranked.map((r) => {
      const job = jobs.find((j) => j.id === r.jobId);
      return {
        job_id: r.jobId,
        title: r.title,
        organization: job?.employer.organizationName,
        sport: job?.sport,
        location: job?.location,
        total_score: r.totalScore,
        score_breakdown: r.scoreBreakdown,
      };
    }),
  };
}

export async function getMatchResults(args: {
  job_id?: string;
  seeker_id?: string;
  min_score?: number;
  limit?: number;
}) {
  const limit = clampLimit(args.limit, 100, 20);
  const results = await prisma.matchResult.findMany({
    where: {
      ...(args.job_id ? { jobId: args.job_id } : {}),
      ...(args.seeker_id ? { seekerId: args.seeker_id } : {}),
      ...(args.min_score != null ? { totalScore: { gte: args.min_score } } : {}),
    },
    include: { seeker: true, job: true },
    orderBy: { totalScore: "desc" },
    take: limit,
  });

  return {
    ok: true as const,
    count: results.length,
    matches: results.map((r) => ({
      match_id: r.id,
      job_id: r.jobId,
      job_title: r.job.title,
      seeker_id: r.seekerId,
      seeker_name: r.seeker.fullName,
      total_score: r.totalScore,
      score_breakdown: r.scoreBreakdown,
      status: r.status,
    })),
  };
}

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

  const topSeekers = await prisma.seekerProfile.findMany({
    where: { isSearchable: true },
    select: { id: true, fullName: true, headline: true },
    take: 5,
  });

  return {
    ok: true as const,
    total_seekers: seekers,
    total_jobs: jobs,
    active_jobs: activeJobs,
    total_matches: matches,
    jobs_by_sport: jobsBySport.map((g) => ({
      sport: g.sport ?? "unknown",
      count: g._count,
    })),
    sample_seekers: topSeekers.map((s) => ({
      seeker_id: s.id,
      full_name: s.fullName,
      headline: s.headline,
    })),
  };
}
