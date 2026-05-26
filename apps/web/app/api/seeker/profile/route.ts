import { getSeekerProfileById, updateSeekerProfile } from "@sportshire/services";
import { NextResponse } from "next/server";
import { getDemoSeekerId } from "@/lib/demo-session";

export async function GET() {
  const seekerId = await getDemoSeekerId();
  if (!seekerId) {
    return NextResponse.json({ ok: false, error: "No demo seeker" }, { status: 404 });
  }
  const result = await getSeekerProfileById(seekerId);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    profile: result.data,
    completeness: result.completeness,
  });
}

export async function PATCH(request: Request) {
  const seekerId = await getDemoSeekerId();
  if (!seekerId) {
    return NextResponse.json({ ok: false, error: "No demo seeker" }, { status: 404 });
  }
  const body = await request.json();
  const result = await updateSeekerProfile(seekerId, body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
