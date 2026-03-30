# Deploy the frontend to Cloudflare Workers

The **Next.js app** in `frontend/` is configured with [**OpenNext**](https://opennext.js.org/cloudflare) + **Wrangler** (`wrangler.jsonc`, `open-next.config.ts`).

The **Express API** in `backend/` does **not** run on Cloudflare Workers (it needs a long-lived Node process + Prisma). Host the API on **Render**, **Railway**, **Fly.io**, or similar, then point the web app at it.

## 1. Environment variable

Set **`NEXT_PUBLIC_API_URL`** to your **public API base URL** (no trailing slash), e.g. `https://tickets-api.onrender.com`.

- **Cloudflare Dashboard** → your Worker → **Settings** → **Variables** (and **Build variables** if you use Workers Builds).
- Locally for Cloudflare preview, use `frontend/.dev.vars` (gitignored):

  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```

## 2. CORS on the API

On the API host, set **`CORS_ORIGINS`** to include:

- Your Cloudflare URL (e.g. `https://ticketswap.<subdomain>.workers.dev`)
- Any custom domain you add

## 3. Deploy from your machine

```bash
cd frontend
npm ci
npx wrangler login
npm run deploy
```

`npm run deploy` runs `opennextjs-cloudflare build` then `opennextjs-cloudflare deploy`.

## 4. Deploy from GitHub (Workers Builds)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Connect Git repository**.
2. Select **HashemKhw/TicketSwap** (or your fork).
3. **Root directory:** `frontend`
4. **Build command:** `npm ci && npm run deploy`
5. Add **Build variable** / **Variable:** `NEXT_PUBLIC_API_URL` = your API URL.

Cloudflare’s Git integration supplies auth for Wrangler during the build.

## 5. Worker name

`wrangler.jsonc` sets **`name`: `ticketswap`**. Change it if that name is taken in your account (and keep **`services[0].service`** the same as **`name`**).

## Windows note

OpenNext warns that **WSL** is recommended for builds. CI (Linux) avoids that issue. Local `npm run deploy` on Windows may still work; if not, use WSL or rely on Cloudflare’s build pipeline.
