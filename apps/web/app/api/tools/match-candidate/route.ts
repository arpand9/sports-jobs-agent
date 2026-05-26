import { matchCandidateToJob } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function POST(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const body = (await request.json()) as { seeker_id?: string; job_id?: string };
  if (!body.seeker_id || !body.job_id) {
    return NextResponse.json(
      { ok: false, error: "seeker_id and job_id required" },
      { status: 400 }
    );
  }

  const result = await matchCandidateToJob(body.seeker_id, body.job_id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
