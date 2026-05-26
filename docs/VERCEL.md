# Deploy on Vercel

## Project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js (auto) |
| **Install Command** | *(from `apps/web/vercel.json`)* `cd ../.. && npm install` |
| **Build Command** | *(from `apps/web/vercel.json`)* `cd ../.. && npm run vercel-build` |
| **Node.js** | 20.x |

`apps/web/vercel.json` is committed — Vercel picks it up when root is `apps/web`.

## Required environment variables

```env
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB?sslmode=require
SPORTSHIRE_AI_JUDGE=1
```

Optional:

```env
SPORTSHIRE_SKIP_AUTH=1
NEXTAUTH_URL=https://your-app.vercel.app
```

## Database (not included on Vercel)

Use **Neon**, **Supabase**, or **Vercel Postgres**. After first deploy:

```bash
# From your machine, with production DATABASE_URL
npm run db:push
npm run db:seed
```

Without a seeded Postgres, the site **builds** but API/pages return DB errors at runtime.

## What deploys

- ✅ Next.js web app + `/api/tools/*` REST agents
- ❌ MCP stdio server (`apps/mcp-server`) — run locally or on a VM, not Vercel

## Build verification (local)

Simulates a clean Vercel install:

```bash
npm ci
npm run vercel-build
```

Fixes applied for Vercel:

1. `postinstall` runs `prisma generate` before workspace builds
2. Root `vercel-build` script for monorepo
3. `export const dynamic = "force-dynamic"` — no DB access required at build time
