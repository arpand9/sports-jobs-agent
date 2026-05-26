# REST API — agent tools

Base URL: `http://localhost:3000` (local dev)

## Authentication

When `SPORTSHIRE_AI_JUDGE=1` or `NODE_ENV=development`: **no headers required**.

Otherwise pass:

```http
x-sportshire-api-key: sh_demo_sportshire_arpand9
```

## Response shape

Success tools return `{ "ok": true, ... }`. Errors return `{ "ok": false, "error": "..." }` with 4xx status.

---

## `GET /api/tools/stats`

Marketplace counts and sample seeker IDs.

**Example**

```bash
curl -s http://localhost:3000/api/tools/stats
```

---

## `GET /api/tools/search-jobs`

| Query | Type | Description |
|-------|------|-------------|
| `query` | string | Title, org, sport keywords |
| `sport` | string | Filter sport |
| `job_type` | enum | `full_time`, `part_time`, `internship`, `contract`, `seasonal` |
| `location` | string | Location substring |
| `limit` | int | Default 20 |

**Example**

```bash
curl -s "http://localhost:3000/api/tools/search-jobs?query=hockey+boston&limit=10"
```

**Returns** `{ ok, jobs: [{ job_id, title, organization, sport, location, ... }] }`

---

## `GET /api/tools/search-candidates`

| Query | Type | Description |
|-------|------|-------------|
| `query` | string | Name, skills, headline |
| `sports` | string | Comma-separated |
| `limit` | int | |

**Example**

```bash
curl -s "http://localhost:3000/api/tools/search-candidates?query=Sarah"
```

---

## `POST /api/tools/find-best-jobs`

Rank active jobs for a seeker. **No billing gate.**

**Body**

```json
{
  "seeker_id": "uuid-optional",
  "seeker_name": "Sarah Chen",
  "limit": 10,
  "minimum_score": 0
}
```

Provide `seeker_id` **or** `seeker_name`.

---

## `POST /api/tools/find-best-candidates`

Rank seekers for a job. **No billing gate.**

**Body**

```json
{
  "job_id": "uuid-optional",
  "job_title": "Sports Analytics Manager",
  "organization": "Boston Celtics",
  "limit": 10,
  "minimum_score": 0
}
```

---

## `GET /api/tools/job`

**Query:** `job_id` (required)

Full job + `scoring_criteria`.

---

## `GET /api/tools/candidate`

**Query:** `seeker_id` (required)

Full structured seeker profile.

---

## `POST /api/tools/match-candidate`

Score one seeker against one job and persist.

**Body**

```json
{ "seeker_id": "...", "job_id": "..." }
```

---

## `POST /api/tools/match-results`

Read saved matches from DB.

**Body**

```json
{
  "job_id": "optional",
  "seeker_id": "optional",
  "min_score": 0,
  "limit": 20
}
```

---

## `POST /api/tools/apply-to-job`

Submit application (scores + status `seeker_interested`). **No billing gate on this route.**

**Body**

```json
{
  "seeker_name": "Sarah Chen",
  "job_title": "Sports Analytics Manager",
  "organization": "Celtics"
}
```

Or use UUIDs: `seeker_id`, `job_id`.

---

## `GET /api/jobs/:id/matches`

Public-style job matches (no auth). Returns job metadata + ranked candidates with scores.

```bash
curl -s http://localhost:3000/api/jobs/JOB_UUID/matches
```

---

## `GET /api/stats/marketplace`

HTML app stats (same DB counts, slightly different shape than `/api/tools/stats`).

---

## Demo / UI-only routes (not required for judges)

| Route | Purpose |
|-------|---------|
| `POST /api/demo/session` | Set demo seeker/employer cookies |
| `POST /api/demo/billing` | Toggle UI Pro cookies |
| `GET/PATCH /api/seeker/profile` | Demo seeker CRUD |
| `POST /api/seeker/apply` | UI apply (uses Pro cookie) |

Agent judges should prefer `/api/tools/*`.
