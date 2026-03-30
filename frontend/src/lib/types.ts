export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  createdAt: string;
  _count?: { listings: number };
};

export type TicketListing = {
  id: string;
  eventId: string;
  sellerId: string;
  price: string | number;
  quantity: number;
  seatInfo: string;
  createdAt: string;
  event?: Pick<Event, "id" | "title" | "date" | "location">;
  seller?: { id: string; email: string };
};

export type Order = {
  id: string;
  buyerId: string;
  ticketListingId: string;
  totalPrice: string | number;
  quantity: number;
  status: "PENDING" | "PAID";
  stripeSessionId: string | null;
  createdAt: string;
  listing?: TicketListing & { event?: Event };
  buyer?: { id: string; email: string };
};

export type CartLine = {
  ticketListingId: string;
  quantity: number;
  unitPrice: number;
  seatInfo: string;
  eventTitle: string;
  eventId: string;
};
