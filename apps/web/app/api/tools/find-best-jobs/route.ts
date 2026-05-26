import { findBestJobs } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function POST(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const body = (await request.json()) as {
    seeker_id?: string;
    seeker_name?: string;
    limit?: number;
    minimum_score?: number;
  };

  const result = await findBestJobs(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
