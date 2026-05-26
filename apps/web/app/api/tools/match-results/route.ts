import { getMatchResults } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function POST(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const body = (await request.json()) as {
    job_id?: string;
    seeker_id?: string;
    min_score?: number;
    limit?: number;
  };

  const result = await getMatchResults(body);
  return NextResponse.json(result);
}
