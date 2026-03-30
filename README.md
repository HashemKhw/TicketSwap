# Ticket resale marketplace (MVP)

Full-stack MVP: **Next.js** (Vercel) + **Express** (Render) + **PostgreSQL** (Supabase) + **Prisma** + **JWT auth** + **Stripe Checkout** (test mode).

## Folder structure

```
tickets/
├── backend/                 # Express API
│   ├── prisma/
│   │   └── schema.prisma
│   ├── scripts/
│   │   └── promote-admin.ts
│   └── src/
│       ├── index.ts
│       ├── prisma.ts
│       ├── middleware/
│       └── routes/
├── frontend/                # Next.js App Router
│   └── src/
│       ├── app/             # Pages
│       ├── components/
│       ├── context/
│       └── lib/
├── docs/
│   └── API_EXAMPLES.md      # curl & fetch examples
├── DEPLOYMENT.md
└── README.md
```

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free PostgreSQL)
- A [Stripe](https://stripe.com) account (test mode keys)

## Quick start (local)

### 1. Database

1. In Supabase: **Project Settings → Database → Connection string** (URI, direct `5432`).
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `API_PUBLIC_URL=http://localhost:4000`, `CORS_ORIGINS=http://localhost:3000`.

### 2. API

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

API runs at `http://localhost:4000` (`GET /health`).

### 3. First admin user

1. Register at `http://localhost:3000/register`.
2. Promote that user:

```bash
cd backend
npm run promote-admin -- you@example.com
```

### 4. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

Open `http://localhost:3000`.

## Core API routes

| Area    | Method | Path | Notes |
|---------|--------|------|--------|
| Auth    | POST | `/auth/register` | Body: `{ email, password }` |
| Auth    | POST | `/auth/login` | Returns JWT |
| Auth    | GET | `/auth/me` | `Authorization: Bearer …` |
| Events  | GET | `/events` | Public |
| Events  | GET | `/events/:id` | Includes in-stock listings |
| Events  | POST | `/events` | Admin only |
| Tickets | GET | `/tickets?eventId=` | Public |
| Tickets | GET | `/tickets/my/listings` | Seller |
| Tickets | POST | `/tickets` | Authenticated |
| Tickets | PUT | `/tickets/:id` | Owner or admin |
| Tickets | DELETE | `/tickets/:id` | Owner or admin |
| Orders  | POST | `/orders` | Body: `{ items: [{ ticketListingId, quantity }] }` → Stripe Checkout URL |
| Orders  | GET | `/orders/my` | Buyer orders |
| Orders  | GET | `/orders/sales` | Seller paid orders |
| Orders  | GET | `/orders/confirm?session_id=` | After Stripe redirect; marks PAID & decrements stock |
| Orders  | PUT | `/orders/:id/pay` | Body: `{ sessionId }` — same fulfillment as confirm |

See `docs/API_EXAMPLES.md` for concrete requests.

## Frontend pages

- **Public:** `/`, `/events`, `/events/[id]`
- **Auth:** `/login`, `/register`
- **User:** `/dashboard`, `/dashboard/listings`, `/dashboard/listings/[id]/edit`, `/dashboard/orders`, `/dashboard/sales`, `/sell/new`
- **Checkout:** `/cart`, `/checkout`, `/checkout/success`
- **Admin:** `/admin`, `/admin/events`, `/admin/events/new`, `/admin/events/[id]/edit`

## Stripe test card

Use `4242 4242 4242 4242`, any future expiry, any CVC.

## Deployment

- **DEPLOYMENT.md** — Supabase + API (e.g. Render) + general checklist.
- **CLOUDFLARE.md** — deploy the **Next.js frontend** to **Cloudflare Workers** (OpenNext). The API stays on a Node host.

## License

MIT (example project).
