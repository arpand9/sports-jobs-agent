import type { SeekerProfileData } from "./types";

export interface CompletenessItem {
  id: string;
  label: string;
  done: boolean;
  weight: number;
}

export function computeProfileCompleteness(profile: SeekerProfileData): {
  score: number;
  items: CompletenessItem[];
} {
  const items: CompletenessItem[] = [
    { id: "name", label: "Full name", done: !!profile.fullName?.trim(), weight: 10 },
    { id: "headline", label: "Headline", done: !!profile.headline?.trim(), weight: 10 },
    { id: "summary", label: "Summary (50+ chars)", done: (profile.summary?.length ?? 0) >= 50, weight: 15 },
    { id: "location", label: "Location", done: !!profile.location?.trim(), weight: 10 },
    { id: "sports", label: "At least 1 sport", done: profile.sports.length > 0, weight: 10 },
    { id: "skills", label: "3+ rated skills", done: profile.skills.length >= 3, weight: 15 },
    { id: "experience", label: "Work experience", done: profile.experience.length > 0, weight: 15 },
    { id: "education", label: "Education", done: profile.education.length > 0, weight: 10 },
    { id: "roles", label: "Desired roles", done: profile.desiredRoles.length > 0, weight: 5 },
  ];

  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  const score = Math.round((earned / totalWeight) * 100);

  return { score, items };
}
