import { prisma, RemotePreference, type Prisma } from "@sportshire/db";
import { computeProfileCompleteness, toSeekerProfileData } from "@sportshire/shared";
import { validateScoringCriteria, type ScoringCriteriaDocument } from "@sportshire/shared";

export type SeekerProfileInput = {
  fullName?: string;
  headline?: string;
  location?: string;
  willingToRelocate?: boolean;
  remotePreference?: RemotePreference;
  summary?: string;
  yearsExperience?: number;
  sports?: string[];
  skills?: Array<{ name: string; level: string; years?: number }>;
  jobTypes?: string[];
  desiredRoles?: string[];
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  experience?: unknown[];
  education?: unknown[];
  certifications?: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  isSearchable?: boolean;
};

export async function getSeekerProfileById(seekerId: string) {
  const seeker = await prisma.seekerProfile.findUnique({ where: { id: seekerId } });
  if (!seeker) return null;
  const data = toSeekerProfileData(seeker);
  const completeness = computeProfileCompleteness(data);
  return { seeker, data, completeness };
}

export async function updateSeekerProfile(seekerId: string, input: SeekerProfileInput) {
  const existing = await prisma.seekerProfile.findUnique({ where: { id: seekerId } });
  if (!existing) return { ok: false as const, error: "Profile not found" };

  const merged = toSeekerProfileData({
    ...existing,
    fullName: input.fullName ?? existing.fullName,
    headline: input.headline ?? existing.headline,
    location: input.location ?? existing.location,
    summary: input.summary ?? existing.summary,
    yearsExperience: input.yearsExperience ?? existing.yearsExperience,
    sports: (input.sports as string[]) ?? (existing.sports as string[]),
    skills: (input.skills as never) ?? (existing.skills as never),
    jobTypes: (input.jobTypes as string[]) ?? (existing.jobTypes as string[]),
    desiredRoles: (input.desiredRoles as string[]) ?? (existing.desiredRoles as string[]),
    experience: (input.experience as never) ?? (existing.experience as never),
    education: (input.education as never) ?? (existing.education as never),
    certifications: (input.certifications as string[]) ?? (existing.certifications as string[]),
  });

  const { score } = computeProfileCompleteness(merged);

  const updated = await prisma.seekerProfile.update({
    where: { id: seekerId },
    data: {
      ...(input.fullName != null ? { fullName: input.fullName } : {}),
      ...(input.headline != null ? { headline: input.headline } : {}),
      ...(input.location != null ? { location: input.location } : {}),
      ...(input.willingToRelocate != null ? { willingToRelocate: input.willingToRelocate } : {}),
      ...(input.remotePreference != null ? { remotePreference: input.remotePreference } : {}),
      ...(input.summary != null ? { summary: input.summary } : {}),
      ...(input.yearsExperience != null ? { yearsExperience: input.yearsExperience } : {}),
      ...(input.sports != null ? { sports: input.sports } : {}),
      ...(input.skills != null ? { skills: input.skills } : {}),
      ...(input.jobTypes != null ? { jobTypes: input.jobTypes } : {}),
      ...(input.desiredRoles != null ? { desiredRoles: input.desiredRoles } : {}),
      ...(input.desiredSalaryMin != null ? { desiredSalaryMin: input.desiredSalaryMin } : {}),
      ...(input.desiredSalaryMax != null ? { desiredSalaryMax: input.desiredSalaryMax } : {}),
      ...(input.experience != null ? { experience: input.experience as Prisma.InputJsonValue } : {}),
      ...(input.education != null ? { education: input.education as Prisma.InputJsonValue } : {}),
      ...(input.certifications != null ? { certifications: input.certifications } : {}),
      ...(input.portfolioUrl != null ? { portfolioUrl: input.portfolioUrl } : {}),
      ...(input.linkedinUrl != null ? { linkedinUrl: input.linkedinUrl } : {}),
      ...(input.isSearchable != null ? { isSearchable: input.isSearchable } : {}),
      profileCompletenessScore: score,
      lastActiveAt: new Date(),
    },
  });

  const data = toSeekerProfileData(updated);
  return {
    ok: true as const,
    profile: data,
    completeness: computeProfileCompleteness(data),
  };
}

export async function getEmployerProfileById(employerId: string) {
  return prisma.employerProfile.findUnique({
    where: { id: employerId },
    include: { jobPostings: { orderBy: { createdAt: "desc" } } },
  });
}

export async function updateEmployerProfile(
  employerId: string,
  input: {
    organizationName?: string;
    orgType?: string;
    sport?: string;
    league?: string;
    location?: string;
    website?: string;
    description?: string;
    employeeCountRange?: string;
  }
) {
  const existing = await prisma.employerProfile.findUnique({ where: { id: employerId } });
  if (!existing) return { ok: false as const, error: "Employer not found" };

  const updated = await prisma.employerProfile.update({
    where: { id: employerId },
    data: input,
  });
  return { ok: true as const, profile: updated };
}

export async function createJobPosting(
  employerId: string,
  input: {
    title: string;
    description: string;
    sport?: string;
    location?: string;
    remoteOption?: string;
    jobType: string;
    salaryMin?: number;
    salaryMax?: number;
    scoringCriteria: ScoringCriteriaDocument;
    status?: "draft" | "active";
  }
) {
  const validation = validateScoringCriteria(input.scoringCriteria);
  if (!validation.valid) {
    return { ok: false as const, error: "error" in validation ? validation.error : "Invalid criteria" };
  }

  const job = await prisma.jobPosting.create({
    data: {
      employerId,
      title: input.title,
      description: input.description,
      sport: input.sport,
      location: input.location,
      remoteOption: (input.remoteOption as never) ?? "on_site",
      jobType: input.jobType as never,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      scoringCriteria: JSON.parse(JSON.stringify(input.scoringCriteria)) as Prisma.InputJsonValue,
      status: input.status === "draft" ? "draft" : "active",
    },
  });

  return { ok: true as const, job };
}
