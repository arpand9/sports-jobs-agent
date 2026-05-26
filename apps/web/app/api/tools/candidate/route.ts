import { getCandidateProfile } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function GET(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const seekerId = new URL(request.url).searchParams.get("seeker_id");
  if (!seekerId) {
    return NextResponse.json(
      { ok: false, error: "seeker_id query param required" },
      { status: 400 }
    );
  }

  const result = await getCandidateProfile(seekerId);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
