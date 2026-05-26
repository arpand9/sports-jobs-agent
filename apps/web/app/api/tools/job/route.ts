import { getJobPosting } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function GET(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const jobId = new URL(request.url).searchParams.get("job_id");
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "job_id query param required" }, { status: 400 });
  }

  const result = await getJobPosting(jobId);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
