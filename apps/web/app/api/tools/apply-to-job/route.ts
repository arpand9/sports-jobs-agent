import { applyToJob, resolveJobId, resolveSeekerId } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function POST(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;

  const body = (await request.json()) as {
    seeker_id?: string;
    seeker_name?: string;
    job_id?: string;
    job_title?: string;
    organization?: string;
  };
  const seekerResolved = await resolveSeekerId({
    seeker_id: body.seeker_id,
    seeker_name: body.seeker_name,
  });
  if ("error" in seekerResolved) {
    return NextResponse.json({ ok: false, error: seekerResolved.error }, { status: 400 });
  }

  const jobResolved = await resolveJobId({
    job_id: body.job_id,
    job_title: body.job_title,
    organization: body.organization,
  });
  if ("error" in jobResolved) {
    return NextResponse.json({ ok: false, error: jobResolved.error }, { status: 400 });
  }

  const result = await applyToJob(seekerResolved.seeker_id, jobResolved.job_id, {
    seekerPro: true,
  });

  if (!result.ok && "error" in result && result.error === "paid_plan_required") {
    return NextResponse.json(result, { status: 402 });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
