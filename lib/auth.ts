import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "evonlia_admin";
const WEEK = 7 * 24 * 60 * 60 * 1000;

// Set ADMIN_PASSWORD (and ideally SESSION_SECRET) in your environment.
// In development only, a default password is used so you can try the dashboard immediately.
function password() {
  return process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV !== "production" ? "evonlia-admin" : "");
}
const secret = () => process.env.SESSION_SECRET ?? `evonlia:${password()}`;
export const authConfigured = () => password().length > 0;

const sha = (v: string) => crypto.createHash("sha256").update(v).digest();

export function checkPassword(input: string) {
  return authConfigured() && crypto.timingSafeEqual(sha(input), sha(password()));
}

const sign = (payload: string) => crypto.createHmac("sha256", secret()).update(payload).digest("hex");

export function makeToken() {
  const payload = String(Date.now() + WEEK);
  return `${payload}.${sign(payload)}`;
}

function verify(token: string) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) && Number(payload) > Date.now();
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return !!token && authConfigured() && verify(token);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK / 1000,
};
