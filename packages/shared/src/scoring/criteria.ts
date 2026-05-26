import type { SeekerProfileData, SeekerSkill, SkillLevel } from "../types";
import { SKILL_LEVEL_RANK } from "../types";

const LEVEL_ORDER: SkillLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

export function scoreSkillMatch(
  seeker: SeekerProfileData,
  config: Record<string, unknown>
): { score: number; details: string } {
  const required = (config.skills as string[]) ?? [];
  const minimumLevel = (config.minimum_level as SkillLevel) ?? "intermediate";
  const minRank = SKILL_LEVEL_RANK[minimumLevel];

  if (!required.length) {
    return { score: 100, details: "No required skills specified" };
  }

  const seekerSkills = new Map(
    seeker.skills.map((s) => [s.name.toLowerCase(), s])
  );

  let matched = 0;
  let bonus = 0;
  const matchedNames: string[] = [];

  for (const skill of required) {
    const found = seekerSkills.get(skill.toLowerCase());
    if (found && SKILL_LEVEL_RANK[found.level] >= minRank) {
      matched++;
      matchedNames.push(skill);
      if (SKILL_LEVEL_RANK[found.level] > minRank) {
        bonus += 10;
      }
    }
  }

  const base = (matched / required.length) * 100;
  const score = Math.min(100, base + bonus);
  return {
    score,
    details: `Matched ${matched}/${required.length} skills at required level (${matchedNames.join(", ") || "none"})`,
  };
}

export function scoreRangeMatch(
  seeker: SeekerProfileData,
  config: Record<string, unknown>
): { score: number; details: string } {
  const field = config.field as keyof SeekerProfileData;
  const idealMin = Number(config.ideal_min);
  const idealMax = Number(config.ideal_max);
  const acceptableMin = Number(config.acceptable_min ?? idealMin);

  const raw = seeker[field];
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) {
    return { score: 20, details: `Missing numeric field ${String(field)}` };
  }

  if (value >= idealMin && value <= idealMax) {
    return {
      score: 100,
      details: `${value} years within ideal range (${idealMin}-${idealMax})`,
    };
  }
  if (value >= acceptableMin && value < idealMin) {
    const span = idealMin - acceptableMin || 1;
    const score = 50 + 50 * ((value - acceptableMin) / span);
    return {
      score: Math.round(score),
      details: `${value} years below ideal minimum (${idealMin})`,
    };
  }
  if (value > idealMax) {
    const score = Math.max(60, 100 - 5 * (value - idealMax));
    return {
      score: Math.round(score),
      details: `${value} years above ideal max (${idealMax})`,
    };
  }
  return {
    score: 20,
    details: `${value} years below acceptable minimum (${acceptableMin})`,
  };
}

export function scoreExactMatch(
  seeker: SeekerProfileData,
  config: Record<string, unknown>
): { score: number; details: string } {
  const field = config.field as keyof SeekerProfileData;
  const values = ((config.values as string[]) ?? []).map((v) => v.toLowerCase());
  const raw = seeker[field];

  let haystack: string[] = [];
  if (Array.isArray(raw)) {
    haystack = raw.map((v) => String(v).toLowerCase());
  } else if (typeof raw === "string") {
    haystack = [raw.toLowerCase()];
  }

  const hits = values.filter((v) => haystack.includes(v));
  if (hits.length) {
    return { score: 100, details: `Match: ${hits.join(", ")}` };
  }

  const partial = values.some((v) =>
    haystack.some((h) => h.includes(v) || v.includes(h))
  );
  if (partial) {
    return { score: 50, details: "Partial/related domain match" };
  }

  return { score: 0, details: "No domain match" };
}

const DEGREE_RANK: Record<string, number> = {
  doctorate: 100,
  phd: 100,
  masters: 85,
  master: 85,
  bachelors: 70,
  bachelor: 70,
  bs: 70,
  ba: 70,
  associates: 50,
  associate: 50,
};

function normalizeDegree(degree?: string): number {
  if (!degree) return 20;
  const key = degree.toLowerCase().replace(/\./g, "").replace(/\s+/g, "");
  for (const [k, v] of Object.entries(DEGREE_RANK)) {
    if (key.includes(k)) return v;
  }
  return 50;
}

export function scoreEducationMatch(
  seeker: SeekerProfileData,
  config: Record<string, unknown>
): { score: number; details: string } {
  const preferredFields = ((config.preferred_fields as string[]) ?? []).map((f) =>
    f.toLowerCase()
  );
  const minimumDegree = String(config.minimum_degree ?? "bachelors").toLowerCase();
  const minDegreeScore =
    DEGREE_RANK[minimumDegree.replace(/s$/, "")] ??
    DEGREE_RANK[minimumDegree] ??
    70;

  if (!seeker.education.length) {
    return { score: 20, details: "No education on profile" };
  }

  let best = 0;
  let bestDetail = "";

  for (const edu of seeker.education) {
    const degreeScore = normalizeDegree(edu.degree);
    const field = (edu.field ?? "").toLowerCase();
    let fieldScore = 30;
    if (preferredFields.some((pf) => field.includes(pf) || pf.includes(field))) {
      fieldScore = field === preferredFields.find((pf) => field.includes(pf))
        ? 100
        : 70;
    }
    const score = degreeScore * 0.4 + fieldScore * 0.6;
    if (score > best) {
      best = score;
      bestDetail = `${edu.degree ?? "Degree"} in ${edu.field ?? "unknown field"} at ${edu.institution}`;
    }
  }

  const finalScore = Math.max(best, minDegreeScore * 0.5);
  return {
    score: Math.round(Math.min(100, finalScore)),
    details: bestDetail || "Education evaluated",
  };
}

export function scoreSemanticMatch(
  seeker: SeekerProfileData,
  config: Record<string, unknown>
): { score: number; details: string } {
  const description = String(config.description ?? "").toLowerCase();
  const corpus = [
    seeker.summary ?? "",
    seeker.headline ?? "",
    ...seeker.experience.map((e) => `${e.description ?? ""} ${(e.achievements ?? []).join(" ")}`),
    ...seeker.skills.map((s) => s.name),
  ]
    .join(" ")
    .toLowerCase();

  if (!description.trim()) {
    return { score: 75, details: "No semantic description configured" };
  }

  const tokens = description
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
  if (!tokens.length) {
    return { score: 70, details: "Semantic criteria too short" };
  }

  const hits = tokens.filter((t) => corpus.includes(t));
  const ratio = hits.length / tokens.length;
  const score = Math.round(40 + ratio * 60);
  return {
    score: Math.min(100, score),
    details: `Keyword alignment ${hits.length}/${tokens.length} (${hits.slice(0, 5).join(", ") || "none"})`,
  };
}

export function toSeekerProfileData(seeker: {
  id: string;
  fullName: string;
  headline?: string | null;
  location?: string | null;
  summary?: string | null;
  yearsExperience?: number | null;
  sports: unknown;
  skills: unknown;
  jobTypes: unknown;
  desiredRoles: unknown;
  experience: unknown;
  education: unknown;
  certifications: unknown;
}): SeekerProfileData {
  return {
    id: seeker.id,
    fullName: seeker.fullName,
    headline: seeker.headline,
    location: seeker.location,
    summary: seeker.summary,
    yearsExperience: seeker.yearsExperience,
    sports: (seeker.sports as string[]) ?? [],
    skills: (seeker.skills as SeekerSkill[]) ?? [],
    jobTypes: (seeker.jobTypes as string[]) ?? [],
    desiredRoles: (seeker.desiredRoles as string[]) ?? [],
    experience: (seeker.experience as SeekerProfileData["experience"]) ?? [],
    education: (seeker.education as SeekerProfileData["education"]) ?? [],
    certifications: (seeker.certifications as string[]) ?? [],
  };
}
