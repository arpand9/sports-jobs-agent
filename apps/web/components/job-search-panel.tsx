"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { JOB_TYPES, SPORTS } from "@/lib/constants";

export type JobListItem = {
  id: string;
  title: string;
  description: string;
  sport: string | null;
  location: string | null;
  jobType: string;
  remoteOption: string;
  salaryMin: number | null;
  salaryMax: number | null;
  employer: { organizationName: string };
};

const SPORT_EMOJI: Record<string, string> = {
  basketball: "🏀",
  football: "🏈",
  soccer: "⚽",
  baseball: "⚾",
  hockey: "🏒",
  esports: "🎮",
  golf: "⛳",
};

export function JobSearchPanel({ jobs }: { jobs: JobListItem[] }) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [jobType, setJobType] = useState("");
  const [remote, setRemote] = useState("");

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const blob = `${job.title} ${job.description} ${job.employer.organizationName}`.toLowerCase();
      if (query && !query.toLowerCase().split(/\s+/).some((t) => blob.includes(t))) return false;
      if (sport && job.sport !== sport) return false;
      if (jobType && job.jobType !== jobType) return false;
      if (remote && job.remoteOption !== remote) return false;
      return true;
    });
  }, [jobs, query, sport, jobType, remote]);

  return (
    <div>
      <div className="glass mb-6 grid gap-4 rounded-3xl p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, org…"
          className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white sm:col-span-2"
        />
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
        >
          <option value="">All sports</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={remote}
          onChange={(e) => setRemote(e.target.value)}
          className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white lg:col-span-4"
        >
          <option value="">Any remote policy</option>
          <option value="remote_only">Remote only</option>
          <option value="hybrid">Hybrid</option>
          <option value="on_site">On-site</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-[var(--muted)]">{filtered.length} gigs match your filters</p>

      <div className="grid gap-4">
        {filtered.map((job) => (
          <Link
            key={job.id}
            href={`/employer/jobs/${job.id}`}
            className="glass block rounded-3xl p-5 transition hover:border-[var(--lime)]/40"
          >
            <div className="flex gap-4">
              <span className="text-3xl">{SPORT_EMOJI[job.sport ?? ""] ?? "🏟️"}</span>
              <div>
                <h2 className="font-display text-xl font-bold">{job.title}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {job.employer.organizationName} · {job.location}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-white/70">{job.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
