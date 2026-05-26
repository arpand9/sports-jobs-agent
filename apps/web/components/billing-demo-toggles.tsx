"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BillingDemoToggles({
  seekerPro,
  employerPro,
}: {
  seekerPro: boolean;
  employerPro: boolean;
}) {
  const router = useRouter();
  const [seeker, setSeeker] = useState(seekerPro);
  const [employer, setEmployer] = useState(employerPro);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch("/api/demo/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seekerPro: seeker, employerPro: employer }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="glass mt-8 rounded-3xl p-6">
      <h3 className="font-display text-xl font-bold">demo billing tiers</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Toggle Pro to demo paid features — applies to web UI and mirrors MCP env vars
        documented on /mcp.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <input
            type="checkbox"
            checked={seeker}
            onChange={(e) => setSeeker(e.target.checked)}
            className="h-5 w-5 accent-[var(--lime)]"
          />
          <span>
            <span className="font-bold text-[var(--lime)]">Seeker Pro</span>
            <span className="mt-1 block text-xs text-[var(--muted)]">apply to jobs</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <input
            type="checkbox"
            checked={employer}
            onChange={(e) => setEmployer(e.target.checked)}
            className="h-5 w-5 accent-[var(--pink)]"
          />
          <span>
            <span className="font-bold text-[var(--pink)]">Employer Pro</span>
            <span className="mt-1 block text-xs text-[var(--muted)]">match scores & ranked roster</span>
          </span>
        </label>
      </div>
      <button type="button" onClick={save} disabled={loading} className="btn-primary mt-6">
        {loading ? "saving…" : "save demo tiers →"}
      </button>
    </div>
  );
}
