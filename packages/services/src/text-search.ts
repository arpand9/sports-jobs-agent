/** Match if every token appears OR the full phrase appears (forgiving agent queries). */
export function matchesTextQuery(blob: string, query: string): boolean {
  const normalized = blob.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (normalized.includes(q)) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  return tokens.some((token) => normalized.includes(token));
}

export function clampLimit(value: number | undefined, max: number, fallback: number): number {
  if (!value || value < 1) return fallback;
  return Math.min(value, max);
}
