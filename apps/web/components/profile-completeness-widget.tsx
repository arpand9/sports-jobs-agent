import type { CSSProperties } from "react";
import type { CompletenessItem } from "@sportshire/shared";

export function ProfileCompletenessWidget({
  score,
  items,
}: {
  score: number;
  items: CompletenessItem[];
}) {
  const ringColor =
    score >= 80 ? "var(--lime)" : score >= 50 ? "var(--cyan)" : "var(--pink)";

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center gap-6">
        <div
          className="score-ring flex h-24 w-24 items-center justify-center"
          style={{ "--pct": score } as CSSProperties}
        >
          <div className="flex h-[calc(100%-6px)] w-[calc(100%-6px)] flex-col items-center justify-center rounded-full bg-[#0c0618]">
            <span className="font-display text-2xl font-extrabold" style={{ color: ringColor }}>
              {score}%
            </span>
            <span className="text-[10px] font-bold uppercase text-white/50">complete</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold">profile completeness</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            higher score = better matches from the AI engine
          </p>
        </div>
      </div>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
              item.done ? "bg-[var(--lime)]/10 text-[var(--lime)]" : "bg-white/5 text-white/50"
            }`}
          >
            <span aria-hidden>{item.done ? "✓" : "○"}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
