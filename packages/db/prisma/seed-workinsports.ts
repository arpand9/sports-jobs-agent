import * as fs from "node:fs";
import * as path from "node:path";
import { JobStatus, JobType, prisma, RemoteOption } from "../src/index";
import { parseScoringCriteria } from "@sportshire/shared";

export type WorkInSportsJob = {
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

function genericScrapedCriteria(sport: string) {
  const sports = sport === "general" ? ["basketball", "football", "soccer"] : [sport];
  return parseScoringCriteria({
    criteria: [
      {
        name: "experience",
        weight: 35,
        type: "range_match",
        config: {
          field: "yearsExperience",
          ideal_min: 1,
          ideal_max: 8,
          acceptable_min: 0,
        },
      },
      {
        name: "sport_domain",
        weight: 35,
        type: "exact_match",
        config: { field: "sports", values: sports },
      },
      {
        name: "cultural_fit",
        weight: 30,
        type: "semantic_match",
        config: {
          description: "Motivated sports industry professional with relevant skills and teamwork",
        },
      },
    ],
  });
}

const JOB_TYPE_MAP: Record<WorkInSportsJob["jobType"], JobType> = {
  full_time: JobType.full_time,
  part_time: JobType.part_time,
  internship: JobType.internship,
  contract: JobType.contract,
  seasonal: JobType.seasonal,
};

export async function seedWorkInSportsJobs(employerId: string): Promise<number> {
  const dataPath = path.join(__dirname, "data/workinsports-boston.json");
  if (!fs.existsSync(dataPath)) {
    console.warn("Skip WorkInSports import: missing prisma/data/workinsports-boston.json");
    console.warn("Run: npm run db:convert-jobs --workspace=@sportshire/db");
    return 0;
  }

  const payload = JSON.parse(fs.readFileSync(dataPath, "utf8")) as {
    jobs: WorkInSportsJob[];
  };

  let created = 0;
  for (const j of payload.jobs) {
    const fullDescription = [
      j.description,
      j.postedAgo ? `Posted: ${j.postedAgo}` : "",
      j.distanceNote ? `Area: ${j.distanceNote}` : "",
      "Source: WorkInSports.com (Boston area scrape)",
    ]
      .filter(Boolean)
      .join("\n\n");

    await prisma.jobPosting.create({
      data: {
        employerId,
        title: j.title.slice(0, 240),
        description: fullDescription.slice(0, 8000),
        sport: j.sport,
        location: j.location.slice(0, 200),
        jobType: JOB_TYPE_MAP[j.jobType],
        remoteOption: RemoteOption.on_site,
        externalApplyUrl: j.url || undefined,
        scoringCriteria: genericScrapedCriteria(j.sport),
        status: JobStatus.active,
      },
    });
    created += 1;
  }

  return created;
}
