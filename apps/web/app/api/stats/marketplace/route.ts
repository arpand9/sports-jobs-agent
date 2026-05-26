import { NextResponse } from "next/server";
import { getMarketplaceStats } from "@/lib/queries";

export async function GET() {
  try {
    const stats = await getMarketplaceStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load stats" },
      { status: 500 }
    );
  }
}
