import { NextResponse } from "next/server";
import {
  EMPLOYER_PRO_COOKIE,
  SEEKER_PRO_COOKIE,
} from "@/lib/billing";

const MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    seekerPro?: boolean;
    employerPro?: boolean;
  };

  const res = NextResponse.json({ ok: true });

  res.cookies.set(SEEKER_PRO_COOKIE, body.seekerPro ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  res.cookies.set(EMPLOYER_PRO_COOKIE, body.employerPro ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return res;
}
