"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApplyJobButton({
  jobId,
  jobTitle,
  seekerPro,
}: {
  jobId: string;
  jobTitle: string;
  seekerPro: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    if (!seekerPro) {
      router.push("/demo?upgrade=seeker");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/seeker/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      error?: string;
      upgrade_hint?: string;
    };
    setLoading(false);
    if (!res.ok || data.error) {
      setError(data.error ?? data.upgrade_hint ?? "Could not apply");
      return;
    }
    setMessage(data.message ?? "Application submitted!");
    router.refresh();
  }

  return (
    <div className="glass mt-8 rounded-3xl p-6">
      <h3 className="font-display text-xl font-bold">ready to shoot your shot?</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {seekerPro
          ? `Apply to ${jobTitle} — we score you against the employer's criteria and notify the hiring team.`
          : "Applying is Seeker Pro. Search and match scores stay free via MCP."}
      </p>
      {message ? (
        <p className="mt-4 text-sm font-semibold text-[var(--lime)]">{message}</p>
      ) : null}
      {error ? <p className="mt-4 text-sm font-semibold text-[var(--pink)]">{error}</p> : null}
      <button
        type="button"
        onClick={apply}
        disabled={loading}
        className={seekerPro ? "btn-primary mt-5" : "btn-ghost mt-5 border-[var(--pink)]/50"}
      >
        {loading ? "submitting…" : seekerPro ? "apply now →" : "unlock seeker pro →"}
      </button>
    </div>
  );
}
