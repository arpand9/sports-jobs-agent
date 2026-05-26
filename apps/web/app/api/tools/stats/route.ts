import { getMarketplaceStats } from "@sportshire/services";
import { NextResponse } from "next/server";
import { authorizeAgentRequest } from "@/lib/api-auth";

export async function GET(request: Request) {
  const denied = authorizeAgentRequest(request);
  if (denied) return denied;
  return NextResponse.json(await getMarketplaceStats());
}
