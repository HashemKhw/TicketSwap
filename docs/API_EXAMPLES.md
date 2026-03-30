# Example API calls

Replace `API` with your base URL (e.g. `http://localhost:4000`), and `TOKEN` with a JWT from `/auth/login`.

## Register & login

```bash
curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"password123"}'
```

```bash
curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"password123"}'
```

## Me (JWT)

```bash
curl -s "$API/auth/me" -H "Authorization: Bearer $TOKEN"
```

## Events (public)

```bash
curl -s "$API/events"
```

```bash
curl -s "$API/events/EVENT_UUID"
```

## Create event (admin JWT)

```bash
curl -s -X POST "$API/events" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Summer Fest","description":"Outdoor show","location":"Austin, TX","date":"2026-07-01T20:00:00.000Z"}'
```

## Listings by event (public)

```bash
curl -s "$API/tickets?eventId=EVENT_UUID"
```

## Create listing (seller JWT)

```bash
curl -s -X POST "$API/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"EVENT_UUID","price":45.5,"quantity":2,"seatInfo":"Sec 101 Row A"}'
```

## My listings

```bash
curl -s "$API/tickets/my/listings" -H "Authorization: Bearer $TOKEN"
```

## Update / delete listing

```bash
curl -s -X PUT "$API/tickets/LISTING_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":50,"quantity":1}'
```

```bash
curl -s -X DELETE "$API/tickets/LISTING_UUID" -H "Authorization: Bearer $TOKEN"
```

## Checkout (creates Stripe session)

```bash
curl -s -X POST "$API/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"ticketListingId":"LISTING_UUID","quantity":1}]}'
```

Response includes `url` — open in browser to pay.

## Confirm after Stripe (browser redirect)

```bash
curl -s "$API/orders/confirm?session_id=cs_test_..."
```

## My orders / sales

```bash
curl -s "$API/orders/my" -H "Authorization: Bearer $TOKEN"
curl -s "$API/orders/sales" -H "Authorization: Bearer $TOKEN"
```

## Fetch (browser / Next.js client)

```typescript
const API = process.env.NEXT_PUBLIC_API_URL!;

const res = await fetch(`${API}/events`);
const { events } = await res.json();

const login = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "a@b.com", password: "password123" }),
});
const { token } = await login.json();

await fetch(`${API}/orders`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    items: [{ ticketListingId: "uuid-here", quantity: 1 }],
  }),
});
```

## Axios (optional)

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const { data } = await api.get("/events");
```
