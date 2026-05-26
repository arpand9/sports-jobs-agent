import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Load .env from monorepo root so Cursor MCP works without manual cwd. */
export function loadMonorepoEnv(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, "../../../.env"),
    resolve(here, "../../../.env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), ".env.local"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path });
    }
  }
}
