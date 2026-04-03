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
  imageUrl?: string | null;
  createdAt: string;
  _count?: { listings: number };
};

export type TicketType = "PDF" | "MOBILE_TRANSFER";

export type FulfillmentStatus = "PENDING" | "AWAITING_SELLER" | "READY" | "TRANSFERRED";

export type UploadedAsset = {
  bucket: string;
  path: string;
  fileName: string;
  url: string | null;
};

export type TicketListing = {
  id: string;
  eventId: string;
  sellerId: string;
  price: string | number;
  quantity: number;
  seatInfo: string;
  seatSection?: string | null;
  seatRow?: string | null;
  seatFrom?: number | null;
  seatTo?: number | null;
  seatsTogether?: boolean;
  ticketType?: TicketType;
  pdfFilePath?: string | null;
  pdfFileName?: string | null;
  pdfUploadedAt?: string | null;
  createdAt: string;
  event?: Pick<Event, "id" | "title" | "date" | "location" | "imageUrl">;
  seller?: { id: string; email: string };
};

export type Order = {
  id: string;
  buyerId: string;
  buyerName?: string | null;
  ticketListingId: string;
  totalPrice: string | number;
  quantity: number;
  status: "PENDING" | "PAID";
  fulfillmentStatus?: FulfillmentStatus;
  stripeSessionId: string | null;
  ticketPdfPath?: string | null;
  ticketPdfFileName?: string | null;
  pdfUploadedAt?: string | null;
  sellerDeliveryNote?: string | null;
  transferProofPath?: string | null;
  transferProofName?: string | null;
  transferConfirmedAt?: string | null;
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
