import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  applyToJob,
  findBestCandidates,
  findBestJobs,
  getCandidateProfile,
  getJobPosting,
  getMarketplaceStats,
  getMatchResults,
  matchCandidateToJob,
  searchCandidates,
  searchJobs,
} from "@sportshire/services";
import { z } from "zod";
import { validateApiKey } from "./auth/api-key";
import { loadMonorepoEnv } from "./load-env";

loadMonorepoEnv();

const SERVER_NAME = "sportshire-mcp";
const SERVER_VERSION = "1.2.0";

function jsonContent(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is missing. Set it in .env at repo root or in MCP env config."
    );
    process.exit(1);
  }

  const skipAuth = process.env.SPORTSHIRE_SKIP_AUTH === "1";
  const apiKey = process.env.SPORTSHIRE_API_KEY;
  if (!skipAuth && !(await validateApiKey(apiKey))) {
    console.error(
      "Invalid or missing SPORTSHIRE_API_KEY. Run db:seed and use sh_demo_sportshire_arpand9, or set SPORTSHIRE_SKIP_AUTH=1 for local dev."
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.tool(
    "search_jobs",
    "FREE — Search active sports jobs. Use query for title/org keywords (e.g. 'analytics manager celtics'). Returns job_id for matching tools.",
    {
      query: z.string().optional().describe("Free-text: title, org, sport keywords"),
      sport: z.string().optional(),
      job_type: z
        .enum(["full_time", "part_time", "internship", "contract", "seasonal"])
        .optional(),
      location: z.string().optional(),
      remote_option: z.enum(["remote_only", "hybrid", "on_site"]).optional(),
      salary_min: z.number().int().optional(),
      org_type: z.string().optional().describe("e.g. nba_team, agency, startup"),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async (args) => jsonContent(await searchJobs(args))
  );

  server.tool(
    "search_candidates",
    "Search seeker talent pool. Returns seeker_id for find_best_jobs.",
    {
      query: z.string().optional().describe("Name, skills, sports, headline keywords"),
      sports: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(),
      min_experience_years: z.number().int().optional(),
      max_experience_years: z.number().int().optional(),
      location: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async (args) => jsonContent(await searchCandidates(args))
  );

  server.tool(
    "find_best_candidates",
    "Rank candidates for a job. Pass job_id OR job_title (+ optional organization). Persists scores to DB.",
    {
      job_id: z.string().optional(),
      job_title: z.string().optional().describe("e.g. Sports Analytics Manager"),
      organization: z.string().optional().describe("e.g. Boston Celtics"),
      limit: z.number().int().optional(),
      minimum_score: z.number().optional().describe("Default 0 — set 50+ to filter weak matches"),
    },
    async (args) => {
      if (!args.job_id && !args.job_title) {
        return jsonContent({
          ok: false,
          error: "Provide job_id or job_title (run search_jobs first if needed)",
        });
      }
      return jsonContent(await findBestCandidates(args));
    }
  );

  server.tool(
    "find_best_jobs",
    "Rank jobs for a seeker. Pass seeker_id OR seeker_name (e.g. Sarah Chen). Persists scores to DB.",
    {
      seeker_id: z.string().optional(),
      seeker_name: z.string().optional().describe("Partial full name match"),
      limit: z.number().int().optional(),
      minimum_score: z.number().optional().describe("Default 0"),
    },
    async (args) => {
      if (!args.seeker_id && !args.seeker_name) {
        return jsonContent({
          ok: false,
          error: "Provide seeker_id or seeker_name (run search_candidates first if needed)",
        });
      }
      return jsonContent(await findBestJobs(args));
    }
  );

  server.tool(
    "match_candidate_to_job",
    "Score one seeker against one job and save the result.",
    {
      seeker_id: z.string(),
      job_id: z.string(),
    },
    async (args) => jsonContent(await matchCandidateToJob(args.seeker_id, args.job_id))
  );

  server.tool(
    "apply_to_job",
    "Submit an application (scores + sets status seeker_interested). Pass seeker_id/seeker_name and job_id/job_title.",
    {
      seeker_id: z.string().optional(),
      seeker_name: z.string().optional(),
      job_id: z.string().optional(),
      job_title: z.string().optional(),
      organization: z.string().optional(),
    },
    async (args) => {
      if (!args.seeker_id && !args.seeker_name) {
        return jsonContent({ ok: false, error: "Provide seeker_id or seeker_name" });
      }
      if (!args.job_id && !args.job_title) {
        return jsonContent({ ok: false, error: "Provide job_id or job_title" });
      }
      const { resolveJobId, resolveSeekerId } = await import("@sportshire/services");
      const seeker = await resolveSeekerId({
        seeker_id: args.seeker_id,
        seeker_name: args.seeker_name,
      });
      if ("error" in seeker) return jsonContent({ ok: false, error: seeker.error });
      const job = await resolveJobId({
        job_id: args.job_id,
        job_title: args.job_title,
        organization: args.organization,
      });
      if ("error" in job) return jsonContent({ ok: false, error: job.error });
      return jsonContent(
        await applyToJob(seeker.seeker_id, job.job_id, { seekerPro: true })
      );
    }
  );

  server.tool(
    "get_job_posting",
    "Full job details including scoring_criteria weights.",
    { job_id: z.string() },
    async (args) => jsonContent(await getJobPosting(args.job_id))
  );

  server.tool(
    "get_candidate_profile",
    "Full structured seeker profile by ID.",
    { seeker_id: z.string() },
    async (args) => jsonContent(await getCandidateProfile(args.seeker_id))
  );

  server.tool(
    "get_match_results",
    "Read saved match scores from the database. Filter by job_id and/or seeker_id.",
    {
      job_id: z.string().optional(),
      seeker_id: z.string().optional(),
      min_score: z.number().optional(),
      limit: z.number().int().optional(),
    },
    async (args) => jsonContent(await getMatchResults(args))
  );

  server.tool(
    "get_marketplace_stats",
    "Counts + sample seeker IDs to bootstrap agent workflows.",
    {},
    async () => jsonContent(await getMarketplaceStats())
  );

  server.resource(
    "seeker-profile-schema",
    "sportshire://schema/seeker-profile",
    {
      description: "Valid sports, skill levels, job types",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "sportshire://schema/seeker-profile",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              sports: ["basketball", "football", "soccer", "baseball", "hockey", "esports", "golf"],
              skill_levels: ["beginner", "intermediate", "advanced", "expert"],
              job_types: ["full_time", "part_time", "internship", "contract", "seasonal"],
              ui_pricing_demo: "Freemium toggles at /demo — MCP/API are fully open for agents",
              agent_tips: [
                "search_jobs(query) → job_id — try query=coach boston",
                "search_candidates(query) → seeker_id",
                "find_best_jobs({ seeker_name: 'Sarah Chen' })",
                "find_best_candidates({ job_title: 'Sports Analytics Manager' })",
                "apply_to_job({ seeker_name, job_title })",
                "docs: AGENTS.md, docs/AI_JUDGE.md, docs/API.md",
              ],
            },
            null,
            2
          ),
        },
      ],
    })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
