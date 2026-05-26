/**
 * Agent / AI-judge access helpers.
 * REST tool routes and MCP should expose full marketplace data without billing gates.
 * UI demo paywalls remain cookie-based for the business-model story.
 */

export function isAiJudgeMode(): boolean {
  return (
    process.env.SPORTSHIRE_AI_JUDGE === "1" ||
    process.env.SPORTSHIRE_SKIP_AUTH === "1" ||
    process.env.SPORTSHIRE_API_FULL_ACCESS === "1"
  );
}

/** When true, REST /api/tools/* skips API key checks. */
export function agentAuthOptional(): boolean {
  return isAiJudgeMode() || process.env.NODE_ENV === "development";
}

/** When true, REST /api/tools/* returns full match scores and apply succeeds without Pro cookies. */
export function agentBillingUnlocked(): boolean {
  return isAiJudgeMode() || process.env.NODE_ENV === "development";
}
