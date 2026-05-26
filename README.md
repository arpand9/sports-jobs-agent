# SportsHire AI

**MCP-native sports job marketplace** — structured seeker profiles, employer-weighted scoring criteria, and an MCP server for AI agent discovery and matching.

Built for [Cursor Boston × Hult Sports Hack 2026](https://cursorboston.com/events/cursor-boston-sports-hack-2026) by [@arpand9](https://github.com/arpand9).

## Demo highlights

- **10 seeded seeker profiles** across basketball, football, soccer, esports, and more
- **6 employer profiles** (NBA, NFL, agency, startup, league, **WorkInSports Boston**)
- **367 active jobs** — 5 curated + **362** Boston-area listings scraped from `workinsports.xlsx`
- **Weighted scoring engine** — `skill_match`, `range_match`, `exact_match`, `education_match`, `semantic_match`
- **MCP server** with 10 tools + schema resource (stdio)
- **Next.js UI** — marketplace stats, job search, ranked matches, freemium demo on `/demo`

### For AI judges

See **[AGENTS.md](AGENTS.md)** and **[docs/AI_JUDGE.md](docs/AI_JUDGE.md)**. Set `SPORTSHIRE_AI_JUDGE=1` so all `/api/tools/*` endpoints are open with **no auth or billing gates**. Full REST catalog: [docs/API.md](docs/API.md).

## Quick start

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:generate
npm run db:push
npm run db:convert-jobs   # workinsports.xlsx → JSON (skip if JSON already committed)
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Demo flows (Phase 2 & 3)

1. **http://localhost:3000/demo** — pick seeker (Sarah Chen) + employer (Boston Celtics)
2. **Seeker:** `/seeker/dashboard` · `/seeker/profile` · `/seeker/jobs`
3. **Employer:** `/employer/dashboard` · `/employer/profile` · `/employer/jobs/new` · job match pages

Full walkthrough: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

### Demo MCP API key

```
sh_demo_sportshire_arpand9
```

## MCP server (stdio)

From repo root, with Postgres running and seed complete:

```bash
export DATABASE_URL=postgresql://sportshire:sportshire@localhost:5432/sportshire
export SPORTSHIRE_API_KEY=sh_demo_sportshire_arpand9
npm run dev:mcp
```

### Cursor MCP config

Add to your Cursor MCP settings (adjust `cwd`):

```json
{
  "mcpServers": {
    "sportshire": {
      "command": "npx",
      "args": ["tsx", "apps/mcp-server/src/index.ts"],
      "cwd": "/Users/arpand/Documents/Code-Experiments/sports-jobs-agent",
      "env": {
        "DATABASE_URL": "postgresql://sportshire:sportshire@localhost:5432/sportshire",
        "SPORTSHIRE_API_KEY": "sh_demo_sportshire_arpand9"
      }
    }
  }
}
```

### Freemium model (UI demo)

| Role | Free | Pro (UI toggle at `/demo`) |
|------|------|----------------------------|
| **Seeker** | Search + ranked jobs | Apply button |
| **Employer** | Post jobs | Ranked candidate scores |

**Agents / AI judges:** MCP and `/api/tools/*` are **never paywalled** — see [docs/AI_JUDGE.md](docs/AI_JUDGE.md).

### Example agent session

1. `search_jobs` → query `"Sports Analytics Manager"` (free)
2. `find_best_jobs` with `seeker_name: "Sarah Chen"` (free)
3. Set `SPORTSHIRE_EMPLOYER_PRO=1` → `find_best_candidates` with `job_id`

## Architecture

```
apps/web          Next.js 15 UI + REST API routes
apps/mcp-server   MCP tools (stdio) for agents
packages/db       Prisma + PostgreSQL
packages/shared   Scoring engine + validation
```

## Agent tools (real DB)

Same logic in **MCP** and **REST**:

| Tool | REST | Notes |
|------|------|--------|
| `search_jobs` | `GET /api/tools/search-jobs?query=...` | Returns `job_id` |
| `search_candidates` | `GET /api/tools/search-candidates?query=...` | Returns `seeker_id` |
| `find_best_jobs` | `POST /api/tools/find-best-jobs` | Body: `{ "seeker_name": "Sarah Chen" }` — no UUID needed |
| `find_best_candidates` | `POST /api/tools/find-best-candidates` | Full scores for agents |
| `get_job_posting` | `GET /api/tools/job?job_id=` | Job + scoring criteria |
| `get_candidate_profile` | `GET /api/tools/candidate?seeker_id=` | Structured profile |
| `match_candidate_to_job` | `POST /api/tools/match-candidate` | Pairwise score |
| `get_match_results` | `POST /api/tools/match-results` | Saved matches |
| `apply_to_job` | `POST /api/tools/apply-to-job` | Application flow |
| `get_marketplace_stats` | `GET /api/tools/stats` | Includes sample seeker IDs |

**Live UI:** http://localhost:3000/playground

**MCP tips:** use `job_title` / `seeker_name` instead of UUIDs; `minimum_score` defaults to `0` (was filtering everything at 50).

Restart Cursor MCP after pulling (`.cursor/mcp.json` includes `cwd` + `DATABASE_URL`).

## API routes

- `GET /api/stats/marketplace`
- `GET /api/jobs/:id/matches`

## Sports Hack submission

Hackathon metadata lives in cursor-boston (not this repo):

- Branch: `sports-hack-2026-submissions`
- Folder: `sports-hack-2026-submissions/arpand9/meta.json`

## Post-MVP roadmap

- NextAuth registration flows
- Full 20-seeker seed + profile builder UI
- pgvector embeddings
- SSE MCP transport
- Resume parsing

## License

MIT
