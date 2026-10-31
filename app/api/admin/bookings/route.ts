import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { removeBooking, updateBooking, type Status } from "@/lib/bookings-db";

export const dynamic = "force-dynamic";
const STATUSES: Status[] = ["new", "confirmed", "done", "cancelled"];
type Ctx = { params: Promise<{ ref: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ref } = await params;
  const body = await req.json().catch(() => ({}));
  const patch: { status?: Status; notes?: string } = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "status" }, { status: 422 });
    patch.status = body.status;
  }
  if (body.notes !== undefined) patch.notes = String(body.notes).slice(0, 4000);
  const updated = updateBooking(ref, patch);
  return updated ? NextResponse.json({ booking: updated }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ref } = await params;
  return removeBooking(ref) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
