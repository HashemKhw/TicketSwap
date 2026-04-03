const BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "")
    : "";

function isApiUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("internal server error")
  );
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

function formatError(data: unknown, status: number): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") return JSON.stringify(err);
  }
  return `Request failed (${status})`;
}

export async function api<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const t = getStoredToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { ...rest, headers });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }
  if (!res.ok) {
    throw new Error(formatError(data, res.status));
  }
  return data as T;
}

/** Example: register — auth false until token stored */
export async function registerRequest(email: string, password: string) {
  return api<{ user: import("./types").User; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    auth: false,
  });
}

export async function loginRequest(email: string, password: string) {
  return api<{ user: import("./types").User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    auth: false,
  });
}

export async function meRequest() {
  return api<{ user: import("./types").User }>("/auth/me");
}

export async function fetchEvents() {
  try {
    return await api<{ events: import("./types").Event[] }>("/events", { auth: false });
  } catch (error) {
    if (isApiUnavailableError(error)) {
      return { events: [] };
    }

    throw error;
  }
}

export async function fetchEvent(id: string) {
  return api<{ event: import("./types").Event & { listings: import("./types").TicketListing[] } }>(
    `/events/${id}`,
    { auth: false }
  );
}

export async function createEvent(data: {
  title: string;
  description: string;
  location: string;
  date: string;
}) {
  return api<{ event: import("./types").Event }>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(
  id: string,
  data: Partial<{ title: string; description: string; location: string; date: string }>
) {
  return api<{ event: import("./types").Event }>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string) {
  return api(`/events/${id}`, { method: "DELETE" });
}

export async function fetchTicketsByEvent(eventId: string) {
  return api<{ listings: import("./types").TicketListing[] }>(
    `/tickets?eventId=${encodeURIComponent(eventId)}`,
    { auth: false }
  );
}

export async function createListing(body: {
  eventId: string;
  price: number;
  quantity: number;
  seatInfo: string;
}) {
  return api<{ listing: import("./types").TicketListing }>("/tickets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateListing(
  id: string,
  body: Partial<{ price: number; quantity: number; seatInfo: string }>
) {
  return api<{ listing: import("./types").TicketListing }>(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteListing(id: string) {
  return api(`/tickets/${id}`, { method: "DELETE" });
}

export async function fetchMyListings() {
  return api<{ listings: import("./types").TicketListing[] }>("/tickets/my/listings");
}

export async function createCheckout(items: { ticketListingId: string; quantity: number }[]) {
  return api<{ sessionId: string; url: string | null; orderIds: string[] }>("/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function fetchMyOrders() {
  return api<{ orders: import("./types").Order[] }>("/orders/my");
}

export async function fetchMySales() {
  return api<{ orders: import("./types").Order[] }>("/orders/sales");
}

export async function confirmCheckoutSession(sessionId: string) {
  return api<{ success: boolean }>(
    `/orders/confirm?session_id=${encodeURIComponent(sessionId)}`,
    { auth: false }
  );
}

export async function payOrder(orderId: string, sessionId: string) {
  return api<{ order: import("./types").Order }>(`/orders/${orderId}/pay`, {
    method: "PUT",
    body: JSON.stringify({ sessionId }),
  });
}
