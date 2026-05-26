export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface SeekerSkill {
  name: string;
  level: SkillLevel;
  years?: number;
}

export interface SeekerExperience {
  title: string;
  organization: string;
  org_type?: string;
  sport?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

export interface SeekerEducation {
  institution: string;
  degree?: string;
  field?: string;
  graduation_year?: number;
  gpa?: number;
}

export interface ScoringCriterionConfig {
  name: string;
  weight: number;
  type:
    | "skill_match"
    | "range_match"
    | "exact_match"
    | "education_match"
    | "semantic_match";
  config: Record<string, unknown>;
}

export interface ScoringCriteriaDocument {
  criteria: ScoringCriterionConfig[];
}

export interface SeekerProfileData {
  id: string;
  fullName: string;
  headline?: string | null;
  location?: string | null;
  summary?: string | null;
  yearsExperience?: number | null;
  sports: string[];
  skills: SeekerSkill[];
  jobTypes: string[];
  desiredRoles: string[];
  experience: SeekerExperience[];
  education: SeekerEducation[];
  certifications: string[];
}

export interface CriterionScoreResult {
  score: number;
  weight: number;
  weightedScore: number;
  details: string;
}

export interface MatchScoreResult {
  totalScore: number;
  scoreBreakdown: Record<string, CriterionScoreResult>;
}

export const SKILL_LEVEL_RANK: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

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

export const SPORTS = [
  "basketball",
  "football",
  "soccer",
  "baseball",
  "hockey",
  "esports",
  "golf",
] as const;
