/**
 * Converts repo-root workinsports.xlsx → prisma/data/workinsports-boston.json
 * Run: npm run db:convert-jobs --workspace=@sportshire/db
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

const SPORTS_KEYWORDS = [
  "sports",
  "athletic",
  "nba",
  "nfl",
  "mlb",
  "hockey",
  "basketball",
  "football",
  "soccer",
  "fitness",
  "stadium",
  "team",
  "league",
  "coach",
  "athlete",
  "esports",
  "golf",
  "baseball",
  "lacrosse",
  "volleyball",
  "swimming",
  "cheer",
  "tennis",
];

const SPORT_INFER: Array<{ sport: string; words: string[] }> = [
  { sport: "basketball", words: ["basketball"] },
  { sport: "football", words: ["football", "nfl", "patriots"] },
  { sport: "soccer", words: ["soccer", "futbol"] },
  { sport: "hockey", words: ["hockey"] },
  { sport: "baseball", words: ["baseball"] },
  { sport: "golf", words: ["golf"] },
  { sport: "lacrosse", words: ["lacrosse"] },
  { sport: "volleyball", words: ["volleyball"] },
  { sport: "swimming", words: ["swimming", "swim"] },
  { sport: "esports", words: ["esports", "gaming"] },
  { sport: "tennis", words: ["tennis"] },
];

type ScrapedRow = {
  title: string;
  url: string;
  city: string;
  distanceNote: string;
  postedAgo: string;
  description: string;
  sport: string;
  location: string;
  jobType: "full_time" | "part_time" | "internship" | "contract" | "seasonal";
};

function inferSport(text: string): string {
  const lower = text.toLowerCase();
  for (const row of SPORT_INFER) {
    if (row.words.some((w) => lower.includes(w))) return row.sport;
  }
  return "general";
}

function inferJobType(title: string): ScrapedRow["jobType"] {
  const lower = title.toLowerCase();
  if (lower.includes("intern")) return "internship";
  if (lower.includes("coach") || lower.includes("attendant") || lower.includes("per diem")) {
    return "part_time";
  }
  if (lower.includes("seasonal") || lower.includes("summer")) return "seasonal";
  if (lower.includes("contract")) return "contract";
  return "full_time";
}

function isSportsJob(title: string, description: string): boolean {
  const blob = `${title} ${description}`.toLowerCase();
  return SPORTS_KEYWORDS.some((k) => blob.includes(k));
}

function main() {
  const root = path.resolve(__dirname, "../../..");
  const xlsxPath = path.join(root, "workinsports.xlsx");
  const outPath = path.join(__dirname, "../prisma/data/workinsports-boston.json");

  if (!fs.existsSync(xlsxPath)) {
    console.error(`Missing ${xlsxPath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

  const jobs: ScrapedRow[] = [];

  for (const row of raw) {
    const title = String(row["break-word"] ?? "").trim();
    const url = String(row["break-word href"] ?? "").trim();
    const city = String(row["list-inline-item"] ?? "").trim().replace(/,$/, "");
    const distanceNote = String(row["text-muted"] ?? "").trim();
    const postedAgo = String(row["list-inline-item 3"] ?? "").trim();
    const description = String(row["hidden-xs"] ?? "").trim();

    if (!title) continue;
    if (!isSportsJob(title, description)) continue;

    const location = [city, distanceNote].filter(Boolean).join(" ").trim() || "Boston, MA";
    jobs.push({
      title,
      url,
      city,
      distanceNote,
      postedAgo,
      description: description || title,
      sport: inferSport(`${title} ${description}`),
      location,
      jobType: inferJobType(title),
    });
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ imported_at: new Date().toISOString(), count: jobs.length, jobs }, null, 2));
  console.log(`Wrote ${jobs.length} jobs → ${outPath}`);
}

main();
