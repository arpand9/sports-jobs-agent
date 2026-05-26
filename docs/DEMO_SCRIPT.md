# SportsHire AI — 3-minute demo script

## Setup (before judges)

```bash
npm install
docker compose up -d postgres   # or local Postgres
npm run db:push && npm run db:seed
npm run dev
```

Open http://localhost:3000/demo and confirm **Sarah Chen** + **Boston Celtics**.

**Business model demo (UI only):** at `/demo`, toggle **Seeker Pro** and **Employer Pro** to show paywalls vs unlocked flows. AI judges use open `/api/tools/*` — see [AI_JUDGE.md](./AI_JUDGE.md).

**Scraped data:** 362 Boston WorkInSports jobs — search `coach` or `hockey` on `/seeker/jobs` or via `search_jobs`.

---

## Flow A — Seeker (90 sec)

1. **Dashboard** `/seeker/dashboard` — Sarah’s top matches (**free**); call out **96.6** on Celtics Analytics role.
2. Open a job → **Apply** button shows paywall until Seeker Pro is enabled on `/demo`.
3. Enable **Seeker Pro** → apply succeeds (MCP: `apply_to_job` with `SPORTSHIRE_SEEKER_PRO=1`).

## Flow B — Employer (90 sec)

1. **Dashboard** `/employer/dashboard` — Celtics postings (**posting is free**).
2. **Job detail** — without Employer Pro: paywall on ranked roster; with Pro: full `MatchScoreCard` list.
3. **Post gig** `/employer/jobs/new` — still free; scoring criteria visible to all.

## Flow C — Agent / MCP (30 sec)

1. **Playground** `/playground` — `find_best_jobs` for Sarah (free).
2. `find_best_candidates` without Pro → blurred preview JSON; set `SPORTSHIRE_EMPLOYER_PRO=1` in MCP env for full scores.

---

## Default personas

| Role | Persona |
|------|---------|
| Seeker | Sarah Chen |
| Employer | Boston Celtics |

Switch anytime at `/demo`.
