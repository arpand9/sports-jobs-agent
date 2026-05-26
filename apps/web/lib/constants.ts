export const SPORTS = [
  "basketball",
  "football",
  "soccer",
  "baseball",
  "hockey",
  "esports",
  "golf",
] as const;

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;

export const JOB_TYPES = [
  "full_time",
  "part_time",
  "internship",
  "contract",
  "seasonal",
] as const;

export const REMOTE_PREFS = ["remote_only", "hybrid", "on_site", "flexible"] as const;

export const REMOTE_OPTIONS = ["remote_only", "hybrid", "on_site"] as const;

export const ORG_TYPES = [
  "nba_team",
  "nfl_team",
  "mlb_team",
  "nhl_team",
  "mls_team",
  "college",
  "league_office",
  "agency",
  "media",
  "brand",
  "venue",
  "esports_org",
  "nonprofit",
  "startup",
  "other",
] as const;

export const CRITERION_TYPES = [
  { value: "skill_match", label: "Skills match" },
  { value: "range_match", label: "Experience range" },
  { value: "exact_match", label: "Sport / domain" },
  { value: "education_match", label: "Education" },
  { value: "semantic_match", label: "Culture fit (AI)" },
] as const;
