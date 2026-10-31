import { NextRequest, NextResponse } from "next/server";
import { addBooking, freeSlots, type Booking } from "@/lib/bookings-db";
import { SERVICES } from "@/lib/services";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const serviceId = clean(body.serviceId, 40);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const mode = clean(body.mode, 10) as Booking["mode"];
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);

  if (!SERVICES.some((s) => s.id === serviceId)) return NextResponse.json({ error: "topic" }, { status: 422 });
  if (!["video", "phone", "visit"].includes(mode)) return NextResponse.json({ error: "mode" }, { status: 422 });
  if (name.length < 2) return NextResponse.json({ error: "name" }, { status: 422 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "email" }, { status: 422 });
  if (phone.replace(/\D/g, "").length < 7) return NextResponse.json({ error: "phone" }, { status: 422 });
  if (!freeSlots(date).includes(time)) return NextResponse.json({ error: "taken" }, { status: 409 });

  const booking: Booking = {
    ref: "EV-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: "new",
    serviceId, date, time, mode, name, email, phone,
    company: clean(body.company, 120) || undefined,
    message: clean(body.message, 2000) || undefined,
    createdAt: new Date().toISOString(),
  };
  addBooking(booking);

  const hook = process.env.BOOKING_WEBHOOK_URL;
  if (hook) {
    // Fire and forget: a failing webhook must never fail the customer's booking.
    fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) }).catch(() => {});
  }

  return NextResponse.json({ booking }, { status: 201 });
}
