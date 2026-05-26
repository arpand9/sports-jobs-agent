import { findBestJobs } from "@sportshire/services";
import { NextResponse } from "next/server";
import { getDemoSeekerId } from "@/lib/demo-session";

export async function GET(request: Request) {
  const seekerId = await getDemoSeekerId();
  if (!seekerId) {
    return NextResponse.json({ ok: false, error: "No demo seeker" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;
  const minimumScore = searchParams.get("minimum_score")
    ? Number(searchParams.get("minimum_score"))
    : 0;

  const result = await findBestJobs({ seeker_id: seekerId, limit, minimum_score: minimumScore });
  return NextResponse.json(result);
}
