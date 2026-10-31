import { NextRequest, NextResponse } from "next/server";
import { freeSlots } from "@/lib/bookings-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  return NextResponse.json({ date, slots: freeSlots(date) });
}
