import { JobStatus, prisma } from "@sportshire/db";
import { matchesTextQuery } from "./text-search";

export type ResolvedJob = { job_id: string; title: string; note?: string };
export type ResolvedSeeker = { seeker_id: string; full_name: string; note?: string };

export async function resolveJobId(input: {
  job_id?: string;
  job_title?: string;
  organization?: string;
}): Promise<ResolvedJob | { error: string }> {
  if (input.job_id) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: input.job_id },
      include: { employer: true },
    });
    if (!job) return { error: `No job found with id ${input.job_id}` };
    return { job_id: job.id, title: job.title };
  }

  const titleQuery = input.job_title?.trim();
  if (!titleQuery) {
    return { error: "Provide job_id or job_title" };
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { status: JobStatus.active },
    include: { employer: true },
    take: 50,
  });

  const orgFilter = input.organization?.toLowerCase().trim();
  const matches = jobs.filter((job) => {
    const blob = `${job.title} ${job.employer.organizationName} ${job.description}`;
    if (!matchesTextQuery(blob, titleQuery)) return false;
    if (orgFilter && !job.employer.organizationName.toLowerCase().includes(orgFilter)) {
      return false;
    }
    return true;
  });

  if (!matches.length) {
    return { error: `No active job matched title "${titleQuery}"` };
  }

  matches.sort((a, b) => a.title.length - b.title.length);
  const best = matches[0];
  const result: { job_id: string; title: string; note?: string } = {
    job_id: best.id,
    title: best.title,
  };
  if (matches.length > 1) {
    result.note = `Matched ${matches.length} jobs; using closest: ${best.title}`;
  }
  return result;
}

export async function resolveSeekerId(input: {
  seeker_id?: string;
  seeker_name?: string;
}): Promise<ResolvedSeeker | { error: string }> {
  if (input.seeker_id) {
    const seeker = await prisma.seekerProfile.findUnique({
      where: { id: input.seeker_id },
    });
    if (!seeker) return { error: `No seeker found with id ${input.seeker_id}` };
    return { seeker_id: seeker.id, full_name: seeker.fullName };
  }

  const nameQuery = input.seeker_name?.trim();
  if (!nameQuery) {
    return { error: "Provide seeker_id or seeker_name" };
  }

  const seekers = await prisma.seekerProfile.findMany({
    where: { isSearchable: true },
    take: 100,
  });

  const q = nameQuery.toLowerCase();
  const matches = seekers.filter((s) => {
    const blob = `${s.fullName} ${s.headline ?? ""}`.toLowerCase();
    return blob.includes(q) || matchesTextQuery(blob, q);
  });

  if (!matches.length) {
    return { error: `No seeker matched name "${nameQuery}"` };
  }

  const best =
    matches.find((s) => s.fullName.toLowerCase() === q) ??
    matches.sort((a, b) => a.fullName.length - b.fullName.length)[0];

  const result: { seeker_id: string; full_name: string; note?: string } = {
    seeker_id: best.id,
    full_name: best.fullName,
  };
  if (matches.length > 1) {
    result.note = `Matched ${matches.length} seekers; using ${best.fullName}`;
  }
  return result;
}
