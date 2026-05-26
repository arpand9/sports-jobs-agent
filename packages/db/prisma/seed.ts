import bcrypt from "bcryptjs";
import {
  JobStatus,
  JobType,
  prisma,
  RemoteOption,
  RemotePreference,
  UserRole,
} from "../src/index";
import {
  parseScoringCriteria,
  rankSeekersForJob,
  toSeekerProfileData,
} from "@sportshire/shared";
import { seedWorkInSportsJobs } from "./seed-workinsports";

const DEMO_API_KEY = "sh_demo_sportshire_arpand9";

type SeekerSeed = {
  email: string;
  fullName: string;
  headline: string;
  location: string;
  yearsExperience: number;
  sports: string[];
  skills: Array<{ name: string; level: "beginner" | "intermediate" | "advanced" | "expert"; years: number }>;
  summary: string;
  experience: Array<{
    title: string;
    organization: string;
    org_type: string;
    sport: string;
    start_date: string;
    end_date?: string;
    current?: boolean;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduation_year: number;
  }>;
};

const SEEKERS: SeekerSeed[] = [
  {
    email: "sarah.chen@example.com",
    fullName: "Sarah Chen",
    headline: "Sports Analytics Manager | 5yr NBA Experience",
    location: "Boston, MA",
    yearsExperience: 5,
    sports: ["basketball"],
    skills: [
      { name: "Sports Analytics", level: "expert", years: 5 },
      { name: "Python", level: "advanced", years: 4 },
      { name: "SQL", level: "advanced", years: 5 },
    ],
    summary:
      "Data-driven basketball analyst focused on fan engagement, player performance modeling, and collaborative cross-functional teams.",
    experience: [
      {
        title: "Analytics Coordinator",
        organization: "Boston Celtics",
        org_type: "nba_team",
        sport: "basketball",
        start_date: "2021-06",
        current: true,
        description: "Built dashboards for coaching staff and partnership analytics.",
        achievements: ["Reduced report turnaround 40%", "Led fan segmentation model"],
      },
    ],
    education: [
      {
        institution: "Northeastern University",
        degree: "B.S.",
        field: "Data Science",
        graduation_year: 2020,
      },
    ],
  },
  {
    email: "marcus.johnson@example.com",
    fullName: "Marcus Johnson",
    headline: "Basketball Operations Analyst",
    location: "New York, NY",
    yearsExperience: 3,
    sports: ["basketball", "football"],
    skills: [
      { name: "Sports Analytics", level: "advanced", years: 3 },
      { name: "Python", level: "intermediate", years: 2 },
      { name: "Tableau", level: "advanced", years: 3 },
    ],
    summary: "Operations analyst with strong video and scouting data workflows.",
    experience: [
      {
        title: "Basketball Analyst",
        organization: "Brooklyn Nets",
        org_type: "nba_team",
        sport: "basketball",
        start_date: "2022-08",
        current: true,
        description: "Scouting reports and lineup optimization support.",
      },
    ],
    education: [
      {
        institution: "University of Michigan",
        degree: "M.S.",
        field: "Sport Management",
        graduation_year: 2022,
      },
    ],
  },
  {
    email: "emily.rodriguez@example.com",
    fullName: "Emily Rodriguez",
    headline: "Social Media Intern | NCAA D1",
    location: "Chicago, IL",
    yearsExperience: 1,
    sports: ["basketball", "soccer"],
    skills: [
      { name: "Social Media Management", level: "advanced", years: 2 },
      { name: "Content Strategy", level: "intermediate", years: 1 },
    ],
    summary: "Passionate storyteller building community around college athletics.",
    experience: [
      {
        title: "Marketing Intern",
        organization: "DePaul Athletics",
        org_type: "college",
        sport: "basketball",
        start_date: "2024-09",
        current: true,
        description: "Managed Instagram and TikTok for men's basketball.",
        achievements: ["Grew Instagram 40%"],
      },
    ],
    education: [
      {
        institution: "DePaul University",
        degree: "B.S.",
        field: "Marketing",
        graduation_year: 2026,
      },
    ],
  },
  {
    email: "james.wilson@example.com",
    fullName: "James Wilson",
    headline: "Partnership Sales Associate",
    location: "Dallas, TX",
    yearsExperience: 4,
    sports: ["football"],
    skills: [
      { name: "Partnership Sales", level: "advanced", years: 4 },
      { name: "Salesforce", level: "intermediate", years: 2 },
    ],
    summary: "Relationship-driven seller with NFL and agency sponsorship experience.",
    experience: [
      {
        title: "Partnership Coordinator",
        organization: "Octagon",
        org_type: "agency",
        sport: "football",
        start_date: "2021-01",
        end_date: "2024-06",
        description: "Managed regional brand activations for NFL clients.",
      },
    ],
    education: [
      {
        institution: "SMU",
        degree: "B.S.",
        field: "Business",
        graduation_year: 2020,
      },
    ],
  },
  {
    email: "priya.patel@example.com",
    fullName: "Priya Patel",
    headline: "Full-Stack Developer | Sports Tech",
    location: "Remote",
    yearsExperience: 6,
    sports: ["basketball", "esports"],
    skills: [
      { name: "TypeScript", level: "expert", years: 5 },
      { name: "React", level: "expert", years: 5 },
      { name: "PostgreSQL", level: "advanced", years: 4 },
    ],
    summary: "Engineer building fan-facing apps and real-time stats platforms.",
    experience: [
      {
        title: "Senior Engineer",
        organization: "Playmaker Labs",
        org_type: "startup",
        sport: "esports",
        start_date: "2020-03",
        current: true,
        description: "Led frontend for live esports stats product.",
      },
    ],
    education: [
      {
        institution: "Georgia Tech",
        degree: "B.S.",
        field: "Computer Science",
        graduation_year: 2018,
      },
    ],
  },
  {
    email: "alex.kim@example.com",
    fullName: "Alex Kim",
    headline: "Event Operations Coordinator",
    location: "Los Angeles, CA",
    yearsExperience: 2,
    sports: ["soccer", "baseball"],
    skills: [
      { name: "Event Operations", level: "advanced", years: 2 },
      { name: "Vendor Management", level: "intermediate", years: 2 },
    ],
    summary: "Detail-oriented ops lead for matchday logistics and fan zones.",
    experience: [
      {
        title: "Operations Assistant",
        organization: "LA Galaxy",
        org_type: "mls_team",
        sport: "soccer",
        start_date: "2023-05",
        current: true,
        description: "Stadium operations and gameday volunteer coordination.",
      },
    ],
    education: [
      {
        institution: "UCLA",
        degree: "B.S.",
        field: "Sport Management",
        graduation_year: 2023,
      },
    ],
  },
  {
    email: "taylor.brooks@example.com",
    fullName: "Taylor Brooks",
    headline: "Hockey Analytics Intern",
    location: "Boston, MA",
    yearsExperience: 0,
    sports: ["hockey"],
    skills: [
      { name: "Sports Analytics", level: "beginner", years: 1 },
      { name: "R", level: "intermediate", years: 1 },
    ],
    summary: "Recent grad eager to break into NHL analytics and tracking data.",
    experience: [
      {
        title: "Research Assistant",
        organization: "Boston University Hockey",
        org_type: "college",
        sport: "hockey",
        start_date: "2024-09",
        current: true,
        description: "Tracking data cleanup and shot quality models.",
      },
    ],
    education: [
      {
        institution: "Boston University",
        degree: "B.S.",
        field: "Statistics",
        graduation_year: 2025,
      },
    ],
  },
  {
    email: "daniel.ortiz@example.com",
    fullName: "Daniel Ortiz",
    headline: "Baseball Data Scientist",
    location: "Miami, FL",
    yearsExperience: 7,
    sports: ["baseball"],
    skills: [
      { name: "Sports Analytics", level: "expert", years: 7 },
      { name: "Python", level: "expert", years: 6 },
      { name: "Machine Learning", level: "advanced", years: 4 },
    ],
    summary: "Pitch modeling and player development analytics for pro baseball.",
    experience: [
      {
        title: "Senior Analyst",
        organization: "Miami Marlins",
        org_type: "mlb_team",
        sport: "baseball",
        start_date: "2019-02",
        current: true,
        description: "Biomechanics and pitch design support.",
      },
    ],
    education: [
      {
        institution: "University of Florida",
        degree: "M.S.",
        field: "Data Science",
        graduation_year: 2018,
      },
    ],
  },
  {
    email: "nina.foster@example.com",
    fullName: "Nina Foster",
    headline: "Esports Community Manager",
    location: "Remote",
    yearsExperience: 3,
    sports: ["esports"],
    skills: [
      { name: "Community Management", level: "expert", years: 3 },
      { name: "Discord", level: "advanced", years: 3 },
    ],
    summary: "Built engaged Discord communities for tier-2 esports orgs.",
    experience: [
      {
        title: "Community Lead",
        organization: "Velocity Esports",
        org_type: "esports_org",
        sport: "esports",
        start_date: "2022-01",
        current: true,
        description: "Moderation, creator programs, and tournament comms.",
      },
    ],
    education: [
      {
        institution: "RIT",
        degree: "B.S.",
        field: "New Media",
        graduation_year: 2021,
      },
    ],
  },
  {
    email: "chris.nguyen@example.com",
    fullName: "Chris Nguyen",
    headline: "Golf Partnerships Analyst",
    location: "Orlando, FL",
    yearsExperience: 5,
    sports: ["golf"],
    skills: [
      { name: "Partnership Sales", level: "advanced", years: 5 },
      { name: "CRM", level: "intermediate", years: 3 },
    ],
    summary: "Sponsor ROI analysis and hospitality program design for PGA events.",
    experience: [
      {
        title: "Partnership Analyst",
        organization: "PGA Tour",
        org_type: "league_office",
        sport: "golf",
        start_date: "2020-06",
        current: true,
        description: "Hospitality inventory and sponsor reporting.",
      },
    ],
    education: [
      {
        institution: "UCF",
        degree: "B.S.",
        field: "Business",
        graduation_year: 2019,
      },
    ],
  },
];

function nbaAnalyticsCriteria() {
  return {
    criteria: [
      {
        name: "required_skills",
        weight: 30,
        type: "skill_match",
        config: {
          skills: ["Sports Analytics", "Python", "SQL"],
          minimum_level: "intermediate",
        },
      },
      {
        name: "experience_years",
        weight: 25,
        type: "range_match",
        config: {
          field: "yearsExperience",
          ideal_min: 3,
          ideal_max: 7,
          acceptable_min: 1,
        },
      },
      {
        name: "sport_domain",
        weight: 20,
        type: "exact_match",
        config: { field: "sports", values: ["basketball", "football"] },
      },
      {
        name: "education",
        weight: 10,
        type: "education_match",
        config: {
          preferred_fields: ["Sport Management", "Business", "Data Science"],
          minimum_degree: "bachelors",
        },
      },
      {
        name: "cultural_fit",
        weight: 15,
        type: "semantic_match",
        config: {
          description:
            "Passionate about fan engagement, data-driven, collaborative team player",
        },
      },
    ],
  };
}

async function main() {
  await prisma.matchResult.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.seekerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@sportshire.demo",
      passwordHash,
      role: UserRole.admin,
    },
  });

  await prisma.apiKey.create({
    data: {
      userId: adminUser.id,
      keyHash: await bcrypt.hash(DEMO_API_KEY, 10),
      keyPrefix: DEMO_API_KEY.slice(0, 8),
      name: "Demo MCP Key",
      permissions: ["read", "match"],
    },
  });

  const seekerProfiles: Array<{ id: string; data: ReturnType<typeof toSeekerProfileData> }> = [];

  for (const s of SEEKERS) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash,
        role: UserRole.seeker,
        seekerProfile: {
          create: {
            fullName: s.fullName,
            headline: s.headline,
            location: s.location,
            willingToRelocate: s.location === "Remote",
            remotePreference: s.location === "Remote" ? RemotePreference.remote_only : RemotePreference.flexible,
            summary: s.summary,
            yearsExperience: s.yearsExperience,
            sports: s.sports,
            skills: s.skills,
            jobTypes: ["full_time", "internship"],
            desiredRoles: [s.headline.split("|")[0]?.trim() ?? "Analyst"],
            experience: s.experience,
            education: s.education,
            certifications: [],
            profileCompletenessScore: 85,
            isSearchable: true,
          },
        },
      },
      include: { seekerProfile: true },
    });
    if (user.seekerProfile) {
      seekerProfiles.push({
        id: user.seekerProfile.id,
        data: toSeekerProfileData(user.seekerProfile),
      });
    }
  }

  const employers = [
    {
      email: "hr@celtics.demo",
      org: "Boston Celtics",
      orgType: "nba_team",
      sport: "basketball",
      league: "NBA",
      location: "Boston, MA",
    },
    {
      email: "talent@patriots.demo",
      org: "New England Patriots",
      orgType: "nfl_team",
      sport: "football",
      league: "NFL",
      location: "Foxborough, MA",
    },
    {
      email: "careers@octagon.demo",
      org: "Octagon Sports Agency",
      orgType: "agency",
      sport: "football",
      league: null,
      location: "Stamford, CT",
    },
    {
      email: "jobs@playmaker.demo",
      org: "Playmaker Labs",
      orgType: "startup",
      sport: "esports",
      league: null,
      location: "Remote",
    },
    {
      email: "ops@mls.demo",
      org: "Major League Soccer",
      orgType: "league_office",
      sport: "soccer",
      league: "MLS",
      location: "New York, NY",
    },
    {
      email: "listings@workinsports.demo",
      org: "WorkInSports Boston",
      orgType: "job_board",
      sport: "multi",
      league: null,
      location: "Boston, MA",
    },
  ];

  const employerProfiles: Record<string, string> = {};

  for (const e of employers) {
    const user = await prisma.user.create({
      data: {
        email: e.email,
        passwordHash,
        role: UserRole.employer,
        employerProfile: {
          create: {
            organizationName: e.org,
            orgType: e.orgType,
            sport: e.sport,
            league: e.league ?? undefined,
            location: e.location,
            description: `${e.org} demo employer profile for SportsHire AI.`,
            verified: true,
          },
        },
      },
      include: { employerProfile: true },
    });
    if (user.employerProfile) {
      employerProfiles[e.org] = user.employerProfile.id;
    }
  }

  const jobs = [
    {
      employer: "Boston Celtics",
      title: "Sports Analytics Manager",
      description:
        "Lead basketball analytics for fan engagement, partnership insights, and coaching support.",
      sport: "basketball",
      location: "Boston, MA",
      jobType: JobType.full_time,
      remoteOption: RemoteOption.hybrid,
      salaryMin: 95000,
      salaryMax: 130000,
      scoringCriteria: nbaAnalyticsCriteria(),
    },
    {
      employer: "New England Patriots",
      title: "Social Media Intern",
      description: "Support NFL social content, community management, and gameday storytelling.",
      sport: "football",
      location: "Foxborough, MA",
      jobType: JobType.internship,
      remoteOption: RemoteOption.on_site,
      scoringCriteria: {
        criteria: [
          {
            name: "social_skills",
            weight: 35,
            type: "skill_match",
            config: {
              skills: ["Social Media Management", "Content Strategy"],
              minimum_level: "intermediate",
            },
          },
          {
            name: "education",
            weight: 35,
            type: "education_match",
            config: {
              preferred_fields: ["Marketing", "Communications", "Sport Management"],
              minimum_degree: "bachelors",
            },
          },
          {
            name: "cultural_fit",
            weight: 30,
            type: "semantic_match",
            config: {
              description: "Creative storyteller passionate about football fandom",
            },
          },
        ],
      },
    },
    {
      employer: "Octagon Sports Agency",
      title: "Partnership Sales Associate",
      description: "Sell and service sponsorship packages for league and brand clients.",
      sport: "football",
      location: "Stamford, CT",
      jobType: JobType.full_time,
      remoteOption: RemoteOption.hybrid,
      scoringCriteria: {
        criteria: [
          {
            name: "sales_skills",
            weight: 40,
            type: "skill_match",
            config: {
              skills: ["Partnership Sales", "Salesforce"],
              minimum_level: "intermediate",
            },
          },
          {
            name: "experience_years",
            weight: 30,
            type: "range_match",
            config: {
              field: "yearsExperience",
              ideal_min: 2,
              ideal_max: 6,
              acceptable_min: 1,
            },
          },
          {
            name: "sport_domain",
            weight: 30,
            type: "exact_match",
            config: { field: "sports", values: ["football"] },
          },
        ],
      },
    },
    {
      employer: "Playmaker Labs",
      title: "Full-Stack Developer",
      description: "Build fan-facing sports and esports web apps with modern TypeScript stack.",
      sport: "esports",
      location: "Remote",
      jobType: JobType.full_time,
      remoteOption: RemoteOption.remote_only,
      scoringCriteria: {
        criteria: [
          {
            name: "engineering_skills",
            weight: 50,
            type: "skill_match",
            config: {
              skills: ["TypeScript", "React", "PostgreSQL"],
              minimum_level: "advanced",
            },
          },
          {
            name: "experience_years",
            weight: 25,
            type: "range_match",
            config: {
              field: "yearsExperience",
              ideal_min: 3,
              ideal_max: 10,
              acceptable_min: 2,
            },
          },
          {
            name: "sport_domain",
            weight: 25,
            type: "exact_match",
            config: { field: "sports", values: ["esports", "basketball"] },
          },
        ],
      },
    },
    {
      employer: "Major League Soccer",
      title: "Event Operations Coordinator",
      description: "Coordinate matchday operations for league events and fan activations.",
      sport: "soccer",
      location: "New York, NY",
      jobType: JobType.full_time,
      remoteOption: RemoteOption.on_site,
      scoringCriteria: {
        criteria: [
          {
            name: "ops_skills",
            weight: 40,
            type: "skill_match",
            config: {
              skills: ["Event Operations", "Vendor Management"],
              minimum_level: "intermediate",
            },
          },
          {
            name: "experience_years",
            weight: 30,
            type: "range_match",
            config: {
              field: "yearsExperience",
              ideal_min: 1,
              ideal_max: 4,
              acceptable_min: 0,
            },
          },
          {
            name: "sport_domain",
            weight: 30,
            type: "exact_match",
            config: { field: "sports", values: ["soccer"] },
          },
        ],
      },
    },
  ];

  const createdJobs: Array<{ id: string; title: string; criteria: ReturnType<typeof parseScoringCriteria> }> = [];

  for (const j of jobs) {
    const employerId = employerProfiles[j.employer];
    const criteria = parseScoringCriteria(j.scoringCriteria);
    const job = await prisma.jobPosting.create({
      data: {
        employerId,
        title: j.title,
        description: j.description,
        sport: j.sport,
        location: j.location,
        jobType: j.jobType,
        remoteOption: j.remoteOption,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        scoringCriteria: criteria,
        status: JobStatus.active,
      },
    });
    createdJobs.push({ id: job.id, title: job.title, criteria });
  }

  const workInSportsEmployerId = employerProfiles["WorkInSports Boston"];
  let scrapedCount = 0;
  if (workInSportsEmployerId) {
    scrapedCount = await seedWorkInSportsJobs(workInSportsEmployerId);
    console.log(`WorkInSports Boston scraped jobs: ${scrapedCount}`);
  }

  const nbaJob = createdJobs.find((j) => j.title === "Sports Analytics Manager");
  if (nbaJob) {
    const ranked = rankSeekersForJob(
      seekerProfiles.map((s) => s.data),
      nbaJob.criteria,
      { minimumScore: 40, limit: 5 }
    );

    for (const match of ranked) {
      const seekerId = seekerProfiles.find((s) => s.data.id === match.id)?.id;
      if (!seekerId) continue;
      await prisma.matchResult.create({
        data: {
          jobId: nbaJob.id,
          seekerId,
          totalScore: match.totalScore,
          scoreBreakdown: match.scoreBreakdown,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Seekers: ${seekerProfiles.length}`);
  console.log(`Curated demo jobs: ${createdJobs.length}`);
  console.log(`Scraped Boston jobs: ${scrapedCount}`);
  console.log(`Total jobs: ${createdJobs.length + scrapedCount}`);
  console.log(`Demo MCP API key: ${DEMO_API_KEY}`);
  if (nbaJob) {
    console.log(`Featured job ID (Sports Analytics Manager): ${nbaJob.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
