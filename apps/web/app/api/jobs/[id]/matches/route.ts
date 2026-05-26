import { NextResponse } from "next/server";
import { getJobWithMatches } from "@/lib/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await getJobWithMatches(id);
    if (!data) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        id: data.job.id,
        title: data.job.title,
        organization: data.job.employer.organizationName,
        scoring_criteria: data.job.scoringCriteria,
      },
      candidates: data.ranked.map((c) => ({
        seeker_id: c.id,
        full_name: c.fullName,
        headline: c.headline,
        total_score: c.totalScore,
        score_breakdown: c.scoreBreakdown,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load matches" },
      { status: 500 }
    );
  }
}
