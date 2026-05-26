import { applyToJob } from "@sportshire/services";
import { NextResponse } from "next/server";
import { hasSeekerPro } from "@/lib/billing";
import { getDemoSeekerId } from "@/lib/demo-session";

export async function POST(request: Request) {
  const seekerId = await getDemoSeekerId();
  if (!seekerId) {
    return NextResponse.json({ ok: false, error: "Select a demo seeker at /demo" }, { status: 401 });
  }

  const body = (await request.json()) as { jobId?: string };
  if (!body.jobId) {
    return NextResponse.json({ ok: false, error: "jobId required" }, { status: 400 });
  }

  const seekerPro = await hasSeekerPro();
  const result = await applyToJob(seekerId, body.jobId, { seekerPro });

  if (!result.ok && "error" in result && result.error === "paid_plan_required") {
    return NextResponse.json(result, { status: 402 });
  }
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
