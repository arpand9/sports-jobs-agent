/** MCP agents always get full tool output (no billing blur). UI demo uses separate paywall cookies. */
export function isSeekerPro(): boolean {
  return (
    process.env.SPORTSHIRE_SEEKER_PRO === "1" ||
    process.env.SPORTSHIRE_AI_JUDGE === "1" ||
    process.env.SPORTSHIRE_API_FULL_ACCESS === "1" ||
    process.env.SPORTSHIRE_SKIP_AUTH === "1"
  );
}

export function isEmployerPro(): boolean {
  return (
    process.env.SPORTSHIRE_EMPLOYER_PRO === "1" ||
    process.env.SPORTSHIRE_AI_JUDGE === "1" ||
    process.env.SPORTSHIRE_API_FULL_ACCESS === "1" ||
    process.env.SPORTSHIRE_SKIP_AUTH === "1" ||
    // Default: MCP is agent-facing — full access unless explicitly restricted
    process.env.SPORTSHIRE_ENFORCE_BILLING !== "1"
  );
}
