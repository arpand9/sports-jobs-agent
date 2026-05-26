# Push checklist — Sports Hack 2026

## 1. Push this repo (required)

Local commit is on `main`. Create the GitHub repo and push:

```bash
cd /Users/arpand/Documents/Code-Experiments/sports-jobs-agent

# One-time: authenticate GitHub CLI
gh auth login

# Create public repo + push
gh repo create arpand9/sports-jobs-agent --public --source=. --remote=origin --push
```

If the repo already exists:

```bash
git push -u origin main
```

**Repo URL (for judges):** https://github.com/arpand9/sports-jobs-agent

Update `docs/hack-meta.json` → `videoUrl` with your Loom before the hackathon PR.

---

## 2. Hackathon PR (cursor-boston)

Only `meta.json` goes in the org repo — not the full app.

```bash
# Fork https://github.com/rogerSuperBuilderAlpha/cursor-boston
gh repo fork rogerSuperBuilderAlpha/cursor-boston --clone
cd cursor-boston
git fetch upstream
git checkout -b sports-hack/arpand9 upstream/sports-hack-2026-submissions

mkdir -p sports-hack-2026-submissions/arpand9
cp /path/to/sports-jobs-agent/docs/hack-meta.json sports-hack-2026-submissions/arpand9/meta.json

git add sports-hack-2026-submissions/arpand9/meta.json
git commit -s -m "docs(sports-hack): submit arpand9 project"
git push origin sports-hack/arpand9
```

Open PR:

- **Base:** `rogerSuperBuilderAlpha/cursor-boston` → branch `sports-hack-2026-submissions`
- **Head:** `arpand9/cursor-boston` → branch `sports-hack/arpand9`

Or use GitHub UI after push: https://github.com/rogerSuperBuilderAlpha/cursor-boston/compare/sports-hack-2026-submissions...arpand9:cursor-boston:sports-hack/arpand9

**Deadline:** 4:00 PM ET, May 26, 2026.

---

## 3. What judges will read

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](../AGENTS.md) | Agent entry point |
| [docs/AI_JUDGE.md](./AI_JUDGE.md) | Curl verification checklist |
| [docs/API.md](./API.md) | REST tool catalog |
| [docs/MCP.md](./MCP.md) | MCP tools |

Set `SPORTSHIRE_AI_JUDGE=1` in `.env` before running locally.
