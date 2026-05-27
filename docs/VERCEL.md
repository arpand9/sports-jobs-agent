# Deploy on Vercel

## Project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `.` (repository root — required for npm workspaces) |
| **Framework** | Next.js |
| **Install Command** | `npm install` (from root `vercel.json`) |
| **Build Command** | `npm run vercel-build` |
| **Node.js** | 20.x |

Deploy from the **repo root**, not `apps/web`, so all workspace packages are included.

```bash
cd sports-jobs-agent
npx vercel link
npx vercel deploy --prod
```

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
