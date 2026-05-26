# MCP server — `sportshire-mcp`

**Package:** `apps/mcp-server`  
**Transport:** stdio  
**Version:** 1.2.0

## Run

```bash
# From repo root, with DATABASE_URL in env
npx tsx apps/mcp-server/src/index.ts
```

Or use `.cursor/mcp.json` in this repo.

## Auth

| Variable | Effect |
|----------|--------|
| `SPORTSHIRE_SKIP_AUTH=1` | No API key check |
| `SPORTSHIRE_API_KEY=sh_demo_sportshire_arpand9` | Valid demo key |

**Billing:** MCP tools are **not paywalled**. Full scores and apply always succeed.

## Tools (10)

| Tool | Description | REST equivalent |
|------|-------------|-----------------|
| `search_jobs` | Search active jobs | `GET /api/tools/search-jobs` |
| `search_candidates` | Search talent pool | `GET /api/tools/search-candidates` |
| `find_best_jobs` | Rank jobs for seeker | `POST /api/tools/find-best-jobs` |
| `find_best_candidates` | Rank candidates for job | `POST /api/tools/find-best-candidates` |
| `get_job_posting` | Job detail + criteria | `GET /api/tools/job?job_id=` |
| `get_candidate_profile` | Seeker profile | `GET /api/tools/candidate?seeker_id=` |
| `match_candidate_to_job` | Pairwise score | `POST /api/tools/match-candidate` |
| `get_match_results` | Saved matches | `POST /api/tools/match-results` |
| `apply_to_job` | Submit application | `POST /api/tools/apply-to-job` |
| `get_marketplace_stats` | Counts + samples | `GET /api/tools/stats` |

## Name resolution

You do **not** need UUIDs for most flows:

```json
{ "seeker_name": "Sarah Chen", "limit": 5 }
```

```json
{ "job_title": "Sports Analytics Manager", "organization": "Celtics" }
```

## Resource

`sportshire://schema/seeker-profile` — valid sports, skill levels, job types, agent tips.

## Example session

1. `search_jobs` — `query`: `"coach boston"`  
2. `find_best_jobs` — `seeker_name`: `"Sarah Chen"`  
3. `find_best_candidates` — `job_title`: `"Sports Analytics Manager"`  
4. `apply_to_job` — `seeker_name` + `job_title`

## Env example

```json
{
  "mcpServers": {
    "sportshire": {
      "command": "npx",
      "args": ["tsx", "apps/mcp-server/src/index.ts"],
      "cwd": "/absolute/path/to/sports-jobs-agent",
      "env": {
        "DATABASE_URL": "postgresql://sportshire:sportshire@localhost:5432/sportshire",
        "SPORTSHIRE_SKIP_AUTH": "1"
      }
    }
  }
}
```
