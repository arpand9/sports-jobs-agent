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

## Database (Neon via Vercel Marketplace)

Provisioned as **sportshire-db** (Neon, `iad1`, free plan). `DATABASE_URL` is auto-injected on Production + Preview.

To re-seed production from your machine:

```bash
npx vercel env pull .env.production.local --environment=production --yes
set -a && source .env.production.local && set +a
npm run db:push && npm run db:seed
npx vercel deploy --prod --yes
```

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
