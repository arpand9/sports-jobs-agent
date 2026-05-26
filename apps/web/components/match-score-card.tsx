import type { CSSProperties } from "react";
import type { MatchScoreResult, SeekerProfileData } from "@sportshire/shared";

function scoreVibe(score: number): { label: string; emoji: string; ring: string } {
  if (score >= 85) return { label: "main character energy", emoji: "🔥", ring: "var(--lime)" };
  if (score >= 70) return { label: "lowkey a W", emoji: "✨", ring: "var(--cyan)" };
  if (score >= 50) return { label: "mid but fixable", emoji: "👀", ring: "var(--purple)" };
  return { label: "needs a glow up", emoji: "💤", ring: "#f472b6" };
}

const BAR_COLORS = ["#b8ff3c", "#00e5ff", "#ff2d92", "#a855f7", "#fbbf24"];

export function MatchScoreCard({
  rank,
  candidate,
}: {
  rank: number;
  candidate: SeekerProfileData & MatchScoreResult;
}) {
  const vibe = scoreVibe(candidate.totalScore);
  const pct = Math.min(100, candidate.totalScore);

  return (
    <article className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:border-[var(--pink)]/40">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ background: vibe.ring }}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="score-ring flex h-16 w-16 shrink-0 items-center justify-center"
            style={{ "--pct": pct } as CSSProperties}
          >
            <div className="flex h-[calc(100%-6px)] w-[calc(100%-6px)] flex-col items-center justify-center rounded-full bg-[#0c0618]">
              <span className="font-display text-lg font-extrabold">#{rank}</span>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-2xl font-bold">{candidate.fullName}</h3>
              <span className="sticker sticker-pink text-[10px]">{vibe.emoji} {vibe.label}</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{candidate.headline}</p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="mono font-display text-4xl font-extrabold"
            style={{ color: vibe.ring }}
          >
            {candidate.totalScore}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/50">
            match %
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {candidate.skills.slice(0, 5).map((skill, i) => (
          <span
            key={skill.name}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold"
            style={{
              boxShadow: `inset 0 0 0 1px ${BAR_COLORS[i % BAR_COLORS.length]}33`,
            }}
          >
            {skill.name}{" "}
            <span className="text-white/40">· {skill.level}</span>
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {Object.entries(candidate.scoreBreakdown).map(([name, breakdown], i) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="capitalize text-[var(--muted)]">
                {name.replace(/_/g, " ")}
              </span>
              <span className="mono" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>
                {breakdown.score}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${breakdown.score}%`,
                  background: `linear-gradient(90deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[(i + 1) % BAR_COLORS.length]})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
