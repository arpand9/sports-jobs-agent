# SportsHire AI — guide for AI agents and judges

This repository is an **MCP-native sports job marketplace**. AI agents can search jobs, rank candidates, and apply without UI login.

## Quick start (local)

```bash
npm install
cp .env.example .env
# Set SPORTSHIRE_AI_JUDGE=1 in .env (default in .env.example)
npm run db:push && npm run db:seed
npm run dev
```

Base URL: `http://localhost:3000`

## Agent access policy

| Surface | Auth | Billing gates |
|---------|------|----------------|
| **REST** `/api/tools/*` | Open when `SPORTSHIRE_AI_JUDGE=1` or `NODE_ENV=development` | **None** — full JSON |
| **MCP** `apps/mcp-server` | `SPORTSHIRE_API_KEY` or `SPORTSHIRE_SKIP_AUTH=1` | **None** — full tool output |
| **Web UI** `/demo`, dashboards | Demo cookies | Paywalls for demo story only |

Demo API key (optional header): `sh_demo_sportshire_arpand9`

## Seed data

- **10** structured seeker profiles (e.g. Sarah Chen)
- **5** curated employer jobs (Celtics Analytics Manager, etc.)
- **362** Boston-area jobs scraped from WorkInSports (`workinsports.xlsx` → `packages/db/prisma/data/workinsports-boston.json`)

Search example: `GET /api/tools/search-jobs?query=coach+boston`

## Documentation map

| File | Contents |
|------|----------|
| [docs/AI_JUDGE.md](docs/AI_JUDGE.md) | Evaluation checklist, env vars, sample curls |
| [docs/API.md](docs/API.md) | Every REST agent endpoint with request/response |
| [docs/MCP.md](docs/MCP.md) | MCP tool catalog (parity with REST) |
| [README.md](README.md) | Human setup + architecture |

## Recommended agent workflow

1. `GET /api/tools/stats` — marketplace counts + sample seeker IDs  
2. `GET /api/tools/search-jobs?query=...` — returns `job_id`  
3. `POST /api/tools/find-best-jobs` — `{ "seeker_name": "Sarah Chen" }`  
4. `POST /api/tools/find-best-candidates` — `{ "job_title": "Sports Analytics Manager" }`  
5. `POST /api/tools/apply-to-job` — `{ "seeker_name": "Sarah Chen", "job_title": "..." }`

## MCP server

Config: `.cursor/mcp.json` (stdio, repo root `cwd`, `DATABASE_URL`).

Run smoke: `npm run dev:mcp` (see `apps/mcp-server`).

## Business model (UI only)

Freemium is demonstrated in the **web UI** (`/demo` Pro toggles). **API and MCP are not paywalled** so agents and judges can verify all capabilities.
