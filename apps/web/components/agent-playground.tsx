"use client";

import { useState } from "react";

type ToolId =
  | "search_jobs"
  | "search_candidates"
  | "find_best_jobs"
  | "find_best_candidates"
  | "stats";

const TOOLS: Array<{
  id: ToolId;
  label: string;
  hint: string;
  method: "GET" | "POST";
  path: string;
  defaultBody?: Record<string, unknown>;
}> = [
  {
    id: "search_jobs",
    label: "search_jobs",
    hint: 'query=e.g. "analytics manager"',
    method: "GET",
    path: "/api/tools/search-jobs",
    defaultBody: { query: "Sports Analytics Manager" },
  },
  {
    id: "search_candidates",
    label: "search_candidates",
    hint: 'query=e.g. "Sarah" or skills',
    method: "GET",
    path: "/api/tools/search-candidates",
    defaultBody: { query: "Sarah" },
  },
  {
    id: "find_best_jobs",
    label: "find_best_jobs",
    hint: "seeker_name — no UUID needed",
    method: "POST",
    path: "/api/tools/find-best-jobs",
    defaultBody: { seeker_name: "Sarah Chen", limit: 5 },
  },
  {
    id: "find_best_candidates",
    label: "find_best_candidates",
    hint: "job_title — no UUID needed",
    method: "POST",
    path: "/api/tools/find-best-candidates",
    defaultBody: {
      job_title: "Sports Analytics Manager",
      organization: "Celtics",
      limit: 5,
    },
  },
  {
    id: "stats",
    label: "get_marketplace_stats",
    hint: "sample seeker IDs included",
    method: "GET",
    path: "/api/tools/stats",
  },
];

export function AgentPlayground() {
  const [active, setActive] = useState<ToolId>("search_jobs");
  const [query, setQuery] = useState("Sports Analytics Manager");
  const [seekerName, setSeekerName] = useState("Sarah Chen");
  const [jobTitle, setJobTitle] = useState("Sports Analytics Manager");
  const [organization, setOrganization] = useState("Celtics");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");

  const tool = TOOLS.find((t) => t.id === active)!;

  async function runTool() {
    setLoading(true);
    setOutput("");
    try {
      let url = tool.path;
      let init: RequestInit = { method: tool.method };

      if (tool.method === "GET") {
        const params = new URLSearchParams();
        if (active === "search_jobs" && query) params.set("query", query);
        if (active === "search_candidates" && query) params.set("query", query);
        if (params.toString()) url += `?${params}`;
      } else if (active === "find_best_jobs") {
        init = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seeker_name: seekerName, limit: 5 }),
        };
      } else if (active === "find_best_candidates") {
        init = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_title: jobTitle,
            organization: organization || undefined,
            limit: 5,
          }),
        };
      }

      const res = await fetch(url, init);
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(JSON.stringify({ ok: false, error: String(err) }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="flex flex-col gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
              active === t.id
                ? "border-black bg-[var(--lime)] text-[#0c0618] shadow-[3px_3px_0_#000]"
                : "border-white/15 bg-white/5 text-white hover:border-[var(--pink)]"
            }`}
          >
            <div className="mono text-sm font-bold">{t.label}</div>
            <div className="mt-1 text-xs opacity-80">{t.hint}</div>
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-xl font-bold">{tool.label}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          hits the same PostgreSQL + scoring engine as MCP — real data, not mock
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {(active === "search_jobs" || active === "search_candidates") && (
            <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm">
              <span className="font-semibold text-[var(--muted)]">query</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none focus:border-[var(--lime)]"
              />
            </label>
          )}
          {active === "find_best_jobs" && (
            <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm">
              <span className="font-semibold text-[var(--muted)]">seeker_name</span>
              <input
                value={seekerName}
                onChange={(e) => setSeekerName(e.target.value)}
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none focus:border-[var(--lime)]"
              />
            </label>
          )}
          {active === "find_best_candidates" && (
            <>
              <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
                <span className="font-semibold text-[var(--muted)]">job_title</span>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none focus:border-[var(--lime)]"
                />
              </label>
              <label className="flex min-w-[160px] flex-col gap-1 text-sm">
                <span className="font-semibold text-[var(--muted)]">organization</span>
                <input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none focus:border-[var(--lime)]"
                />
              </label>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={runTool}
          disabled={loading}
          className="btn-primary mt-6 disabled:opacity-60"
        >
          {loading ? "running…" : "run tool →"}
        </button>

        <pre className="mono mt-6 max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-xs leading-relaxed text-[var(--cyan)]">
          {output || "// tap run — JSON from live DB"}
        </pre>
      </div>
    </div>
  );
}
