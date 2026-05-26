import type { ScoringCriteriaDocument } from "./types";

export function validateScoringCriteria(
  doc: ScoringCriteriaDocument
): { valid: true } | { valid: false; error: string } {
  if (!doc.criteria?.length) {
    return { valid: false, error: "At least one criterion is required" };
  }

  const totalWeight = doc.criteria.reduce((sum, c) => sum + c.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return {
      valid: false,
      error: `Criteria weights must sum to 100 (got ${totalWeight})`,
    };
  }

  for (const c of doc.criteria) {
    if (!c.name?.trim()) {
      return { valid: false, error: "Each criterion needs a name" };
    }
    if (c.weight <= 0 || c.weight > 100) {
      return { valid: false, error: `Invalid weight for ${c.name}` };
    }
  }

  return { valid: true };
}

export function parseScoringCriteria(raw: unknown): ScoringCriteriaDocument {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid scoring criteria");
  }
  const doc = raw as ScoringCriteriaDocument;
  const result = validateScoringCriteria(doc);
  if (!result.valid) {
    throw new Error(result.error);
  }
  return doc;
}
