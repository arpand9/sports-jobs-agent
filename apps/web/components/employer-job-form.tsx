"use client";

import type { ScoringCriterionConfig } from "@sportshire/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JOB_TYPES, REMOTE_OPTIONS, SPORTS } from "@/lib/constants";
import {
  ScoringCriteriaBuilder,
  defaultNbaCriteria,
} from "./scoring-criteria-builder";

export function EmployerJobForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [criteria, setCriteria] = useState<ScoringCriterionConfig[]>(defaultNbaCriteria());
  const [form, setForm] = useState({
    title: "",
    description: "",
    sport: "basketball",
    location: "Boston, MA",
    remoteOption: "hybrid",
    jobType: "full_time",
    salaryMin: 80000,
    salaryMax: 120000,
    status: "active" as "draft" | "active",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/employer/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scoringCriteria: { criteria },
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.ok) {
      setError(data.error ?? "Failed to create job");
      return;
    }
    router.push(`/employer/jobs/${data.job.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-2">
      <div className="glass space-y-4 rounded-3xl p-6">
        <h2 className="font-display text-xl font-bold">job details</h2>
        {[
          ["title", "Title", "text"],
          ["description", "Description", "textarea"],
          ["location", "Location", "text"],
        ].map(([key, label, type]) => (
          <label key={key} className="block text-sm">
            <span className="font-semibold text-[var(--muted)]">{label}</span>
            {type === "textarea" ? (
              <textarea
                required
                rows={4}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
              />
            ) : (
              <input
                required
                value={String(form[key as keyof typeof form] ?? "")}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
              />
            )}
          </label>
        ))}
        <label className="block text-sm">
          <span className="font-semibold text-[var(--muted)]">Sport</span>
          <select
            value={form.sport}
            onChange={(e) => setForm({ ...form, sport: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
          >
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="text-[var(--muted)]">Job type</span>
            <select
              value={form.jobType}
              onChange={(e) => setForm({ ...form, jobType: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-[var(--muted)]">Remote</span>
            <select
              value={form.remoteOption}
              onChange={(e) => setForm({ ...form, remoteOption: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white"
            >
              {REMOTE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="text-[var(--muted)]">Salary min</span>
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm">
            <span className="text-[var(--muted)]">Salary max</span>
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        </div>
        {error ? <p className="text-sm font-semibold text-[var(--pink)]">{error}</p> : null}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "posting…" : "publish gig →"}
        </button>
      </div>

      <div className="glass rounded-3xl p-6">
        <ScoringCriteriaBuilder value={criteria} onChange={setCriteria} />
      </div>
    </form>
  );
}
