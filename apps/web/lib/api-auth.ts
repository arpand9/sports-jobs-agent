import { NextResponse } from "next/server";
import { agentAuthOptional } from "@/lib/agent-access";

const DEMO_KEY = "sh_demo_sportshire_arpand9";

/** REST /api/tools/* — open for AI judges when SPORTSHIRE_AI_JUDGE=1 (see docs/AI_JUDGE.md). */
export function authorizeAgentRequest(request: Request): NextResponse | null {
  if (agentAuthOptional()) return null;
  if (process.env.SPORTSHIRE_SKIP_AUTH === "1") return null;

  const header =
    request.headers.get("x-sportshire-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (header === DEMO_KEY || header === process.env.SPORTSHIRE_API_KEY) {
    return null;
  }

  if (process.env.NODE_ENV === "development" && !header) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Unauthorized. Pass header x-sportshire-api-key or Authorization: Bearer <key>",
      demo_key_hint: DEMO_KEY,
    },
    { status: 401 }
  );
}
