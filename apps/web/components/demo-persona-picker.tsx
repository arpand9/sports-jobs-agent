"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoPersonaPicker({
  seekers,
  employers,
  currentSeekerId,
  currentEmployerId,
}: {
  seekers: Array<{ id: string; fullName: string; headline: string | null }>;
  employers: Array<{ id: string; organizationName: string; sport: string | null }>;
  currentSeekerId: string | null;
  currentEmployerId: string | null;
}) {
  const router = useRouter();
  const [seekerId, setSeekerId] = useState(currentSeekerId ?? "");
  const [employerId, setEmployerId] = useState(currentEmployerId ?? "");
  const [loading, setLoading] = useState(false);

  async function apply() {
    setLoading(true);
    await fetch("/api/demo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seekerId, employerId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="glass grid gap-6 rounded-3xl p-6 md:grid-cols-2">
      <label className="block text-sm">
        <span className="font-bold text-[var(--lime)]">Demo seeker</span>
        <select
          value={seekerId}
          onChange={(e) => setSeekerId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white"
        >
          {seekers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName} — {s.headline}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-bold text-[var(--pink)]">Demo employer</span>
        <select
          value={employerId}
          onChange={(e) => setEmployerId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white"
        >
          {employers.map((e) => (
            <option key={e.id} value={e.id}>
              {e.organizationName} ({e.sport})
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={apply}
        disabled={loading}
        className="btn-primary md:col-span-2"
      >
        {loading ? "switching…" : "switch demo persona →"}
      </button>
    </div>
  );
}
