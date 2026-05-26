import { searchJobs } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function GET(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const result = await searchJobs({
    query: searchParams.get("query") ?? undefined,
    sport: searchParams.get("sport") ?? undefined,
    job_type: searchParams.get("job_type") ?? undefined,
    location: searchParams.get("location") ?? undefined,
    remote_option: searchParams.get("remote_option") ?? undefined,
    org_type: searchParams.get("org_type") ?? undefined,
    salary_min: searchParams.get("salary_min")
      ? Number(searchParams.get("salary_min"))
      : undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
  });

  return NextResponse.json(result);
}
