import { searchCandidates } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function GET(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const sports = searchParams.getAll("sports");
  const skills = searchParams.getAll("skills");

  const result = await searchCandidates({
    query: searchParams.get("query") ?? undefined,
    sports: sports.length ? sports : undefined,
    skills: skills.length ? skills : undefined,
    min_experience_years: searchParams.get("min_experience_years")
      ? Number(searchParams.get("min_experience_years"))
      : undefined,
    max_experience_years: searchParams.get("max_experience_years")
      ? Number(searchParams.get("max_experience_years"))
      : undefined,
    location: searchParams.get("location") ?? undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
  });

  return NextResponse.json(result);
}
