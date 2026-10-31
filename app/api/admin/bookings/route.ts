import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listAll } from "@/lib/bookings-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ bookings: listAll() });
}
