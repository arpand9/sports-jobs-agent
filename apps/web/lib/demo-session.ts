import { prisma } from "@sportshire/db";
import { cookies } from "next/headers";

export const SEEKER_COOKIE = "sportshire_seeker_id";
export const EMPLOYER_COOKIE = "sportshire_employer_id";

export const DEFAULT_SEEKER_EMAIL = "sarah.chen@example.com";
export const DEFAULT_EMPLOYER_EMAIL = "hr@celtics.demo";

export async function resolveDefaultSeekerId(): Promise<string | null> {
  const seeker = await prisma.seekerProfile.findFirst({
    where: { user: { email: DEFAULT_SEEKER_EMAIL } },
  });
  return seeker?.id ?? null;
}

export async function resolveDefaultEmployerId(): Promise<string | null> {
  const employer = await prisma.employerProfile.findFirst({
    where: { user: { email: DEFAULT_EMPLOYER_EMAIL } },
  });
  return employer?.id ?? null;
}

export async function getDemoSeekerId(): Promise<string | null> {
  const jar = await cookies();
  const fromCookie = jar.get(SEEKER_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  return resolveDefaultSeekerId();
}

export async function getDemoEmployerId(): Promise<string | null> {
  const jar = await cookies();
  const fromCookie = jar.get(EMPLOYER_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  return resolveDefaultEmployerId();
}

export async function listDemoPersonas() {
  const [seekers, employers] = await Promise.all([
    prisma.seekerProfile.findMany({
      select: { id: true, fullName: true, headline: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.employerProfile.findMany({
      select: { id: true, organizationName: true, sport: true },
      orderBy: { organizationName: "asc" },
    }),
  ]);
  return { seekers, employers };
}
