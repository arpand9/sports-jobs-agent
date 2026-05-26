import { JobStatus, prisma } from "@sportshire/db";
import { toSeekerProfileData } from "@sportshire/shared";
import { clampLimit, matchesTextQuery } from "./text-search";

export async function searchCandidates(args: {
  query?: string;
  sports?: string[];
  skills?: string[];
  min_experience_years?: number;
  max_experience_years?: number;
  location?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = clampLimit(args.limit, 100, 20);
  const offset = args.offset ?? 0;
  const query = args.query?.trim();

  const seekers = await prisma.seekerProfile.findMany({
    where: { isSearchable: true },
    orderBy: { profileCompletenessScore: "desc" },
    take: 200,
  });

  let filtered = seekers.map((s) => toSeekerProfileData(s));

  if (args.sports?.length) {
    const sports = args.sports.map((s) => s.toLowerCase());
    filtered = filtered.filter((s) =>
      s.sports.some((sp) => sports.includes(sp.toLowerCase()))
    );
  }

  if (args.skills?.length) {
    const skills = args.skills.map((s) => s.toLowerCase());
    filtered = filtered.filter((s) =>
      s.skills.some((sk) => skills.some((q) => sk.name.toLowerCase().includes(q)))
    );
  }

  if (args.min_experience_years != null) {
    filtered = filtered.filter((s) => (s.yearsExperience ?? 0) >= args.min_experience_years!);
  }
  if (args.max_experience_years != null) {
    filtered = filtered.filter((s) => (s.yearsExperience ?? 0) <= args.max_experience_years!);
  }

  if (args.location) {
    const loc = args.location.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        (s.location ?? "").toLowerCase().includes(loc) ||
        loc === "remote" ||
        s.location?.toLowerCase() === "remote"
    );
  }

  if (query) {
    filtered = filtered.filter((s) => {
      const blob = [
        s.fullName,
        s.headline,
        s.summary,
        ...s.skills.map((sk) => sk.name),
        ...s.sports,
        ...s.desiredRoles,
      ].join(" ");
      return matchesTextQuery(blob, query);
    });
  }

  const page = filtered.slice(offset, offset + limit);
  return {
    ok: true as const,
    total: filtered.length,
    offset,
    limit,
    candidates: page.map((s) => ({
      seeker_id: s.id,
      full_name: s.fullName,
      headline: s.headline,
      location: s.location,
      years_experience: s.yearsExperience,
      sports: s.sports,
      skills: s.skills.map((sk) => ({ name: sk.name, level: sk.level })),
    })),
  };
}

export async function searchJobs(args: {
  query?: string;
  sport?: string;
  job_type?: string;
  location?: string;
  remote_option?: string;
  salary_min?: number;
  org_type?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = clampLimit(args.limit, 100, 20);
  const offset = args.offset ?? 0;

  const jobs = await prisma.jobPosting.findMany({
    where: {
      status: JobStatus.active,
      ...(args.sport ? { sport: { equals: args.sport, mode: "insensitive" } } : {}),
      ...(args.job_type ? { jobType: args.job_type as never } : {}),
      ...(args.location
        ? { location: { contains: args.location, mode: "insensitive" } }
        : {}),
      ...(args.remote_option ? { remoteOption: args.remote_option as never } : {}),
      ...(args.salary_min ? { salaryMin: { gte: args.salary_min } } : {}),
    },
    include: { employer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let filtered = jobs;
  if (args.org_type) {
    const org = args.org_type.toLowerCase();
    filtered = filtered.filter((j) => (j.employer.orgType ?? "").toLowerCase().includes(org));
  }

  if (args.query?.trim()) {
    const q = args.query.trim();
    filtered = filtered.filter((j) => {
      const blob = `${j.title} ${j.description} ${j.employer.organizationName} ${j.sport ?? ""}`;
      return matchesTextQuery(blob, q);
    });
  }

  const page = filtered.slice(offset, offset + limit);
  return {
    ok: true as const,
    total: filtered.length,
    offset,
    limit,
    jobs: page.map((j) => ({
      job_id: j.id,
      title: j.title,
      organization: j.employer.organizationName,
      org_type: j.employer.orgType,
      sport: j.sport,
      location: j.location,
      job_type: j.jobType,
      remote_option: j.remoteOption,
      salary_min: j.salaryMin,
      salary_max: j.salaryMax,
      description_preview: j.description.slice(0, 200),
    })),
  };
}
