import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createListingSchema = z.object({
  eventId: z.string().uuid(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  seatInfo: z.string(),
});

const updateListingSchema = z.object({
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  seatInfo: z.string().optional(),
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
  const { eventId, price, quantity, seatInfo } = parsed.data;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const listing = await prisma.ticketListing.create({
    data: {
      eventId,
      sellerId: req.user!.sub,
      price,
      quantity,
      seatInfo,
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
  const updated = await prisma.ticketListing.update({
    where: { id: listingId },
    data: parsed.data,
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
