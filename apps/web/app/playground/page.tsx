import { AgentPlayground } from "@/components/agent-playground";
import { BackLink, PageTitle, SiteShell } from "@/components/site-shell";

export default function PlaygroundPage() {
  return (
    <SiteShell active="mcp">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <BackLink href="/" label="back to home" />
        <PageTitle
          eyebrow="live tools"
          title="try the agent tools for real"
          subtitle="same handlers as MCP — search_jobs, find_best_jobs, find_best_candidates hit your seeded Postgres."
        />
        <AgentPlayground />
      </div>
    </SiteShell>
  );
}
