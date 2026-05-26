import { createJobPosting } from "@sportshire/services";
import { NextResponse } from "next/server";
import { getDemoEmployerId } from "@/lib/demo-session";

export async function POST(request: Request) {
  const employerId = await getDemoEmployerId();
  if (!employerId) {
    return NextResponse.json({ ok: false, error: "No demo employer" }, { status: 404 });
  }

  const body = await request.json();
  const result = await createJobPosting(employerId, body);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
