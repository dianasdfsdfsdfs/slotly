# Slotly

A multi-tenant booking SaaS for service businesses (salons, studios, clinics,
independent pros). Each business gets a dashboard and a public booking page;
clients pick a service, a staff member and a time, and book online.

Built as a full-stack portfolio project.

## Features

- **Multi-tenancy & RBAC** — businesses sign up, get isolated data and an
  Owner/Staff membership model.
- **Public booking page** (`/book/[slug]`) — a 4-step wizard: service → staff
  (or “any available”) → date/slot → confirm.
- **Availability engine** — generates real slots from each staff member's
  weekly working hours, time off and existing bookings, with buffers and
  timezone-correct math (`@date-fns/tz`).
- **No double-booking** — enforced at the database level with a PostgreSQL GiST
  exclusion constraint (`btree_gist` + `tsrange`).
- **Auth** — Auth.js (NextAuth v5), email/password with JWT sessions.
- **Customer cabinet** — clients see and cancel their bookings.
- **Transactional email** — booking confirmation & cancellation via Resend +
  React Email.
- **Subscriptions** — Stripe Checkout + Customer Portal, Free/Pro plans with
  plan-gated limits, kept in sync via webhooks.
- **Dark, modern UI** — Tailwind v4 + shadcn/ui (Base UI), emerald accent.

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 7** + **PostgreSQL** (Neon) via a `pg` driver adapter
- **Auth.js v5**, **Stripe**, **Resend** + **React Email**
- **Vitest** for unit tests, **GitHub Actions** for CI

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values
npx prisma migrate dev # create tables
npm run db:seed        # optional: demo business at /book/demo
npm run dev
```

Open http://localhost:3000.

### Environment variables

See [`.env.example`](./.env.example). You need a Neon database, an Auth secret
(`npx auth secret`), and (optionally) Resend and Stripe keys. Run
`npm run stripe:setup` to create the Pro price in your Stripe account.

## Scripts

| Script                       | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `npm run dev`                | Start the dev server                |
| `npm run build` / `start`    | Production build / serve            |
| `npm test`                   | Run Vitest unit tests               |
| `npm run lint` / `typecheck` | Lint / type-check                   |
| `npm run db:seed`            | Seed a demo business                |
| `npm run stripe:setup`       | Create the Stripe Pro product/price |

## Deployment

Deploys to **Vercel**. On Vercel the `vercel-build` script runs
`prisma migrate deploy` before building, so the production database stays in
sync. Set all variables from `.env.example` in the Vercel project, plus
`AUTH_URL` (your production URL) and the production `STRIPE_WEBHOOK_SECRET`
(from a Stripe webhook pointing at `/api/stripe/webhook`).
