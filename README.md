# Evonlia website

Next.js (App Router, TypeScript) · Framer Motion · GSAP + ScrollTrigger · TanStack React Query · Redux Toolkit

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things are
| What | File |
|---|---|
| Company details (email, WhatsApp, hours, weekend days) | `lib/site.ts` |
| Services (EN + AR). Hidden ones have `enabled: false`; delete that line to bring a service back | `lib/services.ts` |
| All page text (EN + AR) | `lib/i18n.ts` |
| Colors | CSS variables at the top of `app/globals.css` |
| Redux (language, booking flow state) | `store/index.ts` |
| React Query hooks (services, slots, create booking) | `lib/api.ts` |
| API routes | `app/api/{services,slots,bookings}/route.ts` |
| Dashboard UI / its API | `components/admin/AdminApp.tsx`, `app/api/admin/*`, `lib/auth.ts` |
| GSAP: hero + pointer light, process scroll line | `components/Hero.tsx`, `components/Process.tsx` |
| Framer Motion: accordion, booking steps, menu, check mark | `Services`, `Booking`, `Header` |

## Dashboard (`/admin`)
Password-protected page for the team: new requests, today / next 7 days, list with status filters and search,
week calendar, and a detail panel per booking (status, WhatsApp / email / call buttons, internal notes, delete).
Cancelling a booking frees its time slot again on the public form.

1. Set `ADMIN_PASSWORD` (and `SESSION_SECRET`, any long random text) in your environment. See `.env.example`.
2. Open `/admin` and sign in. In development only, the password defaults to `evonlia-admin`.
3. In production the dashboard stays locked until `ADMIN_PASSWORD` is set.

## Receiving bookings
Bookings are saved to `data/bookings.json` and, if you set `BOOKING_WEBHOOK_URL`
(see `.env.example`), every booking is also POSTed there as JSON. Point it at Zapier,
Make, n8n, a Slack/Discord webhook, or your own endpoint to get alerts and calendar entries.

On serverless hosts (e.g. Vercel) the filesystem is read-only, so use the webhook or
replace `lib/bookings-db.ts` with a database (Postgres, Supabase, etc.).
