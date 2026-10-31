import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, authConfigured, checkPassword, cookieOptions, isAdmin, makeToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// very small in-memory brute-force guard: 6 attempts per minute per IP
const attempts = new Map<string, { n: number; t: number }>();

export async function GET() {
  return NextResponse.json({ authed: await isAdmin(), configured: authConfigured() });
}

export async function POST(req: NextRequest) {
  
  if (!authConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.t < 60_000 && rec.n >= 6) return NextResponse.json({ error: "too_many" }, { status: 429 });
  attempts.set(ip, rec && now - rec.t < 60_000 ? { n: rec.n + 1, t: rec.t } : { n: 1, t: now });

  const body = await req.json().catch(() => ({}));
  if (!checkPassword(String(body.password ?? ""))) return NextResponse.json({ error: "invalid" }, { status: 401 });

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, makeToken(), cookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
