"use client";

import type { ScoringCriterionConfig } from "@sportshire/shared";
import { useMemo, useState } from "react";
import { CRITERION_TYPES } from "@/lib/constants";

const DEFAULT_CRITERION: ScoringCriterionConfig = {
  name: "required_skills",
  weight: 30,
  type: "skill_match",
  config: { skills: ["Sports Analytics"], minimum_level: "intermediate" },
};

export function ScoringCriteriaBuilder({
  value,
  onChange,
}: {
  value: ScoringCriterionConfig[];
  onChange: (criteria: ScoringCriterionConfig[]) => void;
}) {
  const totalWeight = useMemo(() => value.reduce((s, c) => s + c.weight, 0), [value]);
  const valid = Math.abs(totalWeight - 100) < 0.01;

  function updateAt(index: number, patch: Partial<ScoringCriterionConfig>) {
    const next = value.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange(next);
  }

  function updateConfig(index: number, key: string, val: unknown) {
    const c = value[index];
    updateAt(index, { config: { ...c.config, [key]: val } });
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([
      ...value,
      { ...DEFAULT_CRITERION, name: `criterion_${value.length + 1}` },
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">scoring criteria</h3>
        <span
          className={`sticker text-[10px] ${valid ? "sticker-lime" : "sticker-pink"}`}
        >
          weights: {totalWeight}% {valid ? "✓" : "(must = 100)"}
        </span>
      </div>

      {value.map((c, i) => (
        <div key={i} className="rounded-2xl border border-white/15 bg-black/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Name</span>
              <input
                value={c.name}
                onChange={(e) => updateAt(i, { name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Type</span>
              <select
                value={c.type}
                onChange={(e) =>
                  updateAt(i, { type: e.target.value as ScoringCriterionConfig["type"] })
                }
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
              >
                {CRITERION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">Weight %</span>
              <input
                type="range"
                min={5}
                max={60}
                value={c.weight}
                onChange={(e) => updateAt(i, { weight: Number(e.target.value) })}
                className="mt-2 w-full"
              />
              <div className="mono text-right text-sm text-[var(--lime)]">{c.weight}%</div>
            </label>
          </div>

          {c.type === "skill_match" && (
            <label className="mt-3 block text-sm">
              <span className="text-[var(--muted)]">Skills (comma-separated)</span>
              <input
                defaultValue={(c.config.skills as string[])?.join(", ") ?? ""}
                onBlur={(e) =>
                  updateConfig(
                    i,
                    "skills",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
              />
            </label>
          )}

          {c.type === "range_match" && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["ideal_min", "ideal_max", "acceptable_min"] as const).map((k) => (
                <label key={k} className="text-xs">
                  <span className="text-[var(--muted)]">{k}</span>
                  <input
                    type="number"
                    defaultValue={Number(c.config[k] ?? 0)}
                    onBlur={(e) => updateConfig(i, k, Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-1 text-white"
                  />
                </label>
              ))}
              <input type="hidden" value="yearsExperience" onChange={() => updateConfig(i, "field", "yearsExperience")} />
            </div>
          )}

          {c.type === "exact_match" && (
            <label className="mt-3 block text-sm">
              <span className="text-[var(--muted)]">Sports (comma-separated)</span>
              <input
                defaultValue={((c.config.values as string[]) ?? []).join(", ")}
                onBlur={(e) =>
                  updateConfig(
                    i,
                    "values",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
              />
              <input type="hidden" value="sports" readOnly onFocus={() => updateConfig(i, "field", "sports")} />
            </label>
          )}

          {c.type === "semantic_match" && (
            <label className="mt-3 block text-sm">
              <span className="text-[var(--muted)]">Culture description</span>
              <textarea
                rows={2}
                defaultValue={String(c.config.description ?? "")}
                onBlur={(e) => updateConfig(i, "description", e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
              />
            </label>
          )}

          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-3 text-sm font-semibold text-[var(--pink)]"
          >
            remove criterion
          </button>
        </div>
      ))}

      <button type="button" onClick={add} className="btn-ghost text-sm">
        + add criterion
      </button>
    </div>
  );
}

export function defaultNbaCriteria(): ScoringCriterionConfig[] {
  return [
    {
      name: "required_skills",
      weight: 30,
      type: "skill_match",
      config: { skills: ["Sports Analytics", "Python"], minimum_level: "intermediate" },
    },
    {
      name: "experience_years",
      weight: 25,
      type: "range_match",
      config: { field: "yearsExperience", ideal_min: 2, ideal_max: 8, acceptable_min: 0 },
    },
    {
      name: "sport_domain",
      weight: 25,
      type: "exact_match",
      config: { field: "sports", values: ["basketball"] },
    },
    {
      name: "cultural_fit",
      weight: 20,
      type: "semantic_match",
      config: { description: "Team player, data-driven, passionate about sports" },
    },
  ];
}
