import { getEmployerProfileById, updateEmployerProfile } from "@sportshire/services";
import { NextResponse } from "next/server";
import { getDemoEmployerId } from "@/lib/demo-session";

export async function GET() {
  const employerId = await getDemoEmployerId();
  if (!employerId) {
    return NextResponse.json({ ok: false, error: "No demo employer" }, { status: 404 });
  }
  const profile = await getEmployerProfileById(employerId);
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, profile });
}

export async function PATCH(request: Request) {
  const employerId = await getDemoEmployerId();
  if (!employerId) {
    return NextResponse.json({ ok: false, error: "No demo employer" }, { status: 404 });
  }
  const body = await request.json();
  const result = await updateEmployerProfile(employerId, body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
