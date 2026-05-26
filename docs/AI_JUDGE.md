# AI judge evaluation guide

Use this document to verify SportsHire AI without human login. All agent endpoints return **full data** (no billing blur, no Pro cookies).

## Environment

```bash
cp .env.example .env
```

Required:

```env
DATABASE_URL=postgresql://sportshire:sportshire@localhost:5432/sportshire
SPORTSHIRE_AI_JUDGE=1
```

`SPORTSHIRE_AI_JUDGE=1` means:

- REST `/api/tools/*` does **not** require API keys  
- REST tools return **full** match scores and allow `apply_to_job`  
- MCP uses the same database with full tool output (set `SPORTSHIRE_SKIP_AUTH=1` for MCP if you skip API key)

## Bootstrap database

```bash
npm install
npm run db:push
npm run db:seed
```

Expected seed logs:

- `Seekers: 10`  
- `Curated demo jobs: 5`  
- `WorkInSports Boston scraped jobs: 362` (requires `packages/db/prisma/data/workinsports-boston.json`)

Regenerate scrape JSON from `workinsports.xlsx`:

```bash
npm run db:convert-jobs
```

## Start server

```bash
npm run dev
```

Server: `http://localhost:3000`

## Verification checklist

Run these in order. All should return HTTP 200 and `ok: true` where applicable.

### 1. Marketplace stats

```bash
curl -s http://localhost:3000/api/tools/stats | head -c 500
```

Expect `total_jobs` ≥ 360, `total_seekers` = 10.

### 2. Search scraped Boston jobs

```bash
curl -s "http://localhost:3000/api/tools/search-jobs?query=coach+boston&limit=5"
```

Expect jobs with `organization` or titles containing coach / Boston area.

### 3. Find best jobs for Sarah Chen (free tier capability)

```bash
curl -s -X POST http://localhost:3000/api/tools/find-best-jobs \
  -H "Content-Type: application/json" \
  -d '{"seeker_name":"Sarah Chen","limit":5}'
```

Expect `jobs[]` with `total_score` numbers (not null).

### 4. Find best candidates (employer capability — not paywalled for agents)

```bash
curl -s -X POST http://localhost:3000/api/tools/find-best-candidates \
  -H "Content-Type: application/json" \
  -d '{"job_title":"Sports Analytics Manager","organization":"Celtics","limit":5}'
```

Expect `candidates[]` with real `full_name` and `total_score` (not `"Pro unlock"`).

### 5. Get job + candidate profiles

```bash
# Use job_id from step 2 or seed log "Featured job ID"
curl -s "http://localhost:3000/api/tools/job?job_id=JOB_UUID"
curl -s "http://localhost:3000/api/tools/candidate?seeker_id=SEEKER_UUID"
```

Seeker UUIDs appear in stats `sample_seekers`.

### 6. Match one pair

```bash
curl -s -X POST http://localhost:3000/api/tools/match-candidate \
  -H "Content-Type: application/json" \
  -d '{"seeker_id":"SEEKER_UUID","job_id":"JOB_UUID"}'
```

### 7. Apply to job (seeker capability — not paywalled for agents)

```bash
curl -s -X POST http://localhost:3000/api/tools/apply-to-job \
  -H "Content-Type: application/json" \
  -d '{"seeker_name":"Sarah Chen","job_title":"Sports Analytics Manager"}'
```

Expect `ok: true` and `application.status` = `seeker_interested`.

### 8. Job matches (alternate REST)

```bash
curl -s http://localhost:3000/api/jobs/JOB_UUID/matches
```

## MCP parity

Same logic as REST. Tools: see [MCP.md](./MCP.md).

MCP env (`.cursor/mcp.json`):

```json
{
  "DATABASE_URL": "postgresql://sportshire:sportshire@localhost:5432/sportshire",
  "SPORTSHIRE_API_KEY": "sh_demo_sportshire_arpand9",
  "SPORTSHIRE_SKIP_AUTH": "1"
}
```

## UI vs API

| Feature | Web UI (`/demo`) | Agent API/MCP |
|---------|------------------|---------------|
| Search / rank jobs | Free | Free |
| Apply | Pro toggle demo | Always allowed |
| Employer match roster | Pro toggle demo | Always allowed |

## Scoring engine

Weighted criteria per job (`scoring_criteria` JSON). Implemented in `packages/shared/src/scoring/`. Types: `skill_match`, `range_match`, `exact_match`, `education_match`, `semantic_match`.

## Data provenance

| Source | Count | Employer |
|--------|-------|----------|
| Hand-curated demo | 5 | Celtics, Patriots, Octagon, Playmaker, MLS |
| WorkInSports scrape | 362 | WorkInSports Boston |

Scrape file: repo root `workinsports.xlsx` (source), committed JSON: `packages/db/prisma/data/workinsports-boston.json`.
