import { Router } from "express";
import { z } from "zod";
import { TicketType } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { buildSeatInfo } from "../lib/listing-seats.js";

const router = Router();

const assetSchema = z.object({
  path: z.string().min(1),
  fileName: z.string().min(1),
});

const createListingSchema = z.object({
  eventId: z.string().uuid(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  seatInfo: z.string().optional(),
  seatSection: z.string().trim().optional(),
  seatRow: z.string().trim().optional(),
  seatFrom: z.number().int().positive().optional(),
  seatTo: z.number().int().positive().optional(),
  seatsTogether: z.boolean().default(false),
  ticketType: z.nativeEnum(TicketType),
  pdfAsset: assetSchema.optional(),
});

const updateListingSchema = z.object({
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  seatInfo: z.string().optional(),
  seatSection: z.string().trim().optional(),
  seatRow: z.string().trim().optional(),
  seatFrom: z.number().int().positive().nullable().optional(),
  seatTo: z.number().int().positive().nullable().optional(),
  seatsTogether: z.boolean().optional(),
  ticketType: z.nativeEnum(TicketType).optional(),
  pdfAsset: assetSchema.nullable().optional(),
  clearPdfAsset: z.boolean().optional(),
});

router.get("/", async (req, res) => {
  const eventId = req.query.eventId as string | undefined;
  if (!eventId) {
    res.status(400).json({ error: "eventId query required" });
    return;
  }
  const listings = await prisma.ticketListing.findMany({
    where: { eventId, quantity: { gt: 0 } },
    include: {
      event: { select: { id: true, title: true, date: true, location: true } },
      seller: { select: { id: true, email: true } },
    },
    orderBy: { price: "asc" },
  });
  res.json({ listings });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const {
    eventId,
    price,
    quantity,
    seatInfo,
    seatSection,
    seatRow,
    seatFrom,
    seatTo,
    seatsTogether,
    ticketType,
    pdfAsset,
  } = parsed.data;

  if (ticketType === "MOBILE_TRANSFER" && pdfAsset) {
    res.status(400).json({ error: "Mobile transfer listings cannot include a PDF upload" });
    return;
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  let derivedSeatInfo: string;
  try {
    derivedSeatInfo = buildSeatInfo({
      seatSection,
      seatRow,
      seatFrom,
      seatTo,
      seatsTogether,
      seatInfo,
      quantity,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid seat details" });
    return;
  }

  const listing = await prisma.ticketListing.create({
    data: {
      eventId,
      sellerId: req.user!.sub,
      price,
      quantity,
      seatInfo: derivedSeatInfo,
      seatSection,
      seatRow,
      seatFrom,
      seatTo,
      seatsTogether,
      ticketType,
      pdfFilePath: pdfAsset?.path,
      pdfFileName: pdfAsset?.fileName,
      pdfUploadedAt: pdfAsset ? new Date() : null,
    },
    include: {
      event: { select: { id: true, title: true } },
    },
  });
  res.status(201).json({ listing });
});

router.put("/:id", requireAuth, async (req, res) => {
  const parsed = updateListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const listingId = String(req.params.id);
  const listing = await prisma.ticketListing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (listing.sellerId !== req.user!.sub && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Not your listing" });
    return;
  }

  const nextTicketType = parsed.data.ticketType ?? listing.ticketType;
  const nextQuantity = parsed.data.quantity ?? listing.quantity;
  const nextSeatSection = parsed.data.seatSection ?? listing.seatSection;
  const nextSeatRow = parsed.data.seatRow ?? listing.seatRow;
  const nextSeatFrom =
    parsed.data.seatFrom === undefined ? listing.seatFrom : parsed.data.seatFrom;
  const nextSeatTo = parsed.data.seatTo === undefined ? listing.seatTo : parsed.data.seatTo;
  const nextSeatsTogether = parsed.data.seatsTogether ?? listing.seatsTogether;
  const nextSeatInfoInput = parsed.data.seatInfo ?? listing.seatInfo;

  let derivedSeatInfo: string;
  try {
    derivedSeatInfo = buildSeatInfo({
      seatSection: nextSeatSection,
      seatRow: nextSeatRow,
      seatFrom: nextSeatFrom,
      seatTo: nextSeatTo,
      seatsTogether: nextSeatsTogether,
      seatInfo: nextSeatInfoInput,
      quantity: nextQuantity,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid seat details" });
    return;
  }

  if (nextTicketType === "MOBILE_TRANSFER" && parsed.data.pdfAsset) {
    res.status(400).json({ error: "Mobile transfer listings cannot include a PDF upload" });
    return;
  }

  const clearPdfAsset = parsed.data.clearPdfAsset || nextTicketType === "MOBILE_TRANSFER";
  const pdfAsset = parsed.data.pdfAsset;
  const updated = await prisma.ticketListing.update({
    where: { id: listingId },
    data: {
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      seatInfo: derivedSeatInfo,
      seatSection: nextSeatSection,
      seatRow: nextSeatRow,
      seatFrom: nextSeatFrom,
      seatTo: nextSeatTo,
      seatsTogether: nextSeatsTogether,
      ticketType: nextTicketType,
      pdfFilePath: clearPdfAsset ? null : pdfAsset?.path ?? listing.pdfFilePath,
      pdfFileName: clearPdfAsset ? null : pdfAsset?.fileName ?? listing.pdfFileName,
      pdfUploadedAt: clearPdfAsset
        ? null
        : pdfAsset
          ? new Date()
          : listing.pdfUploadedAt,
    },
    include: { event: { select: { id: true, title: true } } },
  });
  res.json({ listing: updated });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const listingId = String(req.params.id);
  const listing = await prisma.ticketListing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (listing.sellerId !== req.user!.sub && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Not your listing" });
    return;
  }
  await prisma.ticketListing.delete({ where: { id: listingId } });
  res.status(204).send();
});

router.get("/my/listings", requireAuth, async (req, res) => {
  const listings = await prisma.ticketListing.findMany({
    where: { sellerId: req.user!.sub },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ listings });
});

export default router;
