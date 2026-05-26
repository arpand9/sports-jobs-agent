import { NextResponse } from "next/server";
import { EMPLOYER_COOKIE, SEEKER_COOKIE } from "@/lib/demo-session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    seekerId?: string;
    employerId?: string;
  };

  const res = NextResponse.json({ ok: true });
  const opts = {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax" as const,
  };

  if (body.seekerId) {
    res.cookies.set(SEEKER_COOKIE, body.seekerId, opts);
  }
  if (body.employerId) {
    res.cookies.set(EMPLOYER_COOKIE, body.employerId, opts);
  }

  return res;
}
