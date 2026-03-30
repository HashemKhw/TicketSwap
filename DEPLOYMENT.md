# Deployment checklist (free tier)

Deploy order: **Supabase** → **Render (API)** → **Vercel (web)** → **Stripe URLs**.

## 1. Supabase (database)

1. Create a project (free tier).
2. **Settings → Database → Database password** — save it.
3. Use the **direct** Postgres URI (port `5432`), e.g.  
   `postgresql://postgres.[ref]:[PASSWORD]@db.[ref].supabase.co:5432/postgres?sslmode=require`
4. This value is `DATABASE_URL` for the API.

Run migrations from your machine (or CI) after the API repo is connected:

```bash
cd backend
# set DATABASE_URL in .env to the same Supabase URI
npx prisma db push
```

## 2. Render (Express API)

1. New **Web Service** → connect the Git repo (or deploy from this folder).
2. **Root directory:** `backend`
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start`
5. **Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase URI (same as local) |
| `JWT_SECRET` | Long random string (32+ chars) |
| `STRIPE_SECRET_KEY` | `sk_test_…` (or live later) |
| `STRIPE_WEBHOOK_SECRET` | Optional for MVP; confirm flow uses `/orders/confirm` |
| `API_PUBLIC_URL` | Your Render URL, e.g. `https://tickets-api.onrender.com` (no trailing slash) |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://your-app.vercel.app` (comma-separate multiple) |
| `PORT` | Render sets automatically — do not override unless you know the port |

6. Free tier sleeps on idle; first request after sleep can be slow.

## 3. Stripe

1. **Developers → API keys** — use **test** secret key on Render.
2. No redirect URL config is required in Stripe Dashboard for Checkout; success/cancel URLs are set in code.
3. Ensure **Customer email** collection if you want receipts (optional for MVP).

## 4. Vercel (Next.js)

1. Import the repo; **root directory:** `frontend`
2. **Environment variable:**

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | Render API URL, e.g. `https://tickets-api.onrender.com` (no trailing slash) |

3. Deploy. Update Render `CORS_ORIGINS` to include the final Vercel domain.

## 5. Smoke test (production)

1. Register on the Vercel site.
2. On your machine (with `DATABASE_URL` pointing at Supabase):  
   `cd backend && npm run promote-admin -- your@email.com`
3. Log in as admin → create an event.
4. Log in as a second user (or same) → create a listing → buy with another account → Stripe test card → success page → **My orders** shows `PAID`.

## Troubleshooting

- **CORS errors:** Add exact Vercel URL to `CORS_ORIGINS` on Render (scheme + host, no path).
- **Stripe redirect loops:** `API_PUBLIC_URL` must match the API the browser calls; `NEXT_PUBLIC_API_URL` must match Render.
- **Prisma on Render:** `postinstall` runs `prisma generate`; `build` runs `prisma generate && tsc`.
