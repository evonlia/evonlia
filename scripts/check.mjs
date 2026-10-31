// Finds files that were overwritten by a same-named file from a sub-folder (a copy/merge mistake: every API folder has a route.ts, every page a page.tsx).
// Example: app/api/admin/bookings/route.ts holding the code of app/api/admin/bookings/[ref]/route.ts.
// Run: npm run check. It also runs before every build, so a damaged project stops with a clear message. It changes nothing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".next", ".git", "data", "public"]);
const files = [];
const walk = (d) => { for (const n of fs.readdirSync(d)) { if (SKIP.has(n)) continue; const p = path.join(d, n); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } };
walk(ROOT);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

const bad = [];
for (const f of files) {
  if (!/\.(tsx?|jsx?|mjs)$/.test(f)) continue;
  const body = fs.readFileSync(f);
  if (body.length < 120) continue;
  const dir = path.dirname(f), base = path.basename(f);
  const twin = files.find((g) => g !== f && path.basename(g) === base && g.startsWith(dir + path.sep) && fs.readFileSync(g).equals(body));
  if (twin) bad.push(`${rel(f)} is a copy of ${rel(twin)}`);
}
// A route.ts that handles /api/admin/bookings must not take a { ref } param (that belongs to bookings/[ref]).
const list = path.join(ROOT, "app/api/admin/bookings/route.ts");
if (fs.existsSync(list) && /params:\s*Promise<\{\s*ref/.test(fs.readFileSync(list, "utf8"))) bad.push("app/api/admin/bookings/route.ts has the [ref] code (it should only list bookings with GET)");

if (bad.length) {
  console.log("Damaged files:\n- " + [...new Set(bad)].join("\n- ") + "\nRestore each one from a clean copy of the project (just that file), then run again.");
  process.exit(1);
}
console.log("OK: no overwritten files found.");
