import { Router } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const checkoutItemSchema = z.object({
  ticketListingId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
});

const paySchema = z.object({
  sessionId: z.string().min(1),
});

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

function frontendUrl(): string {
  const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",")[0]?.trim();
  return origins || "http://localhost:3000";
}

function apiPublicUrl(): string {
  return (process.env.API_PUBLIC_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

/** Create pending orders and Stripe Checkout Session (test mode). */
router.post("/", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { items } = parsed.data;
  const buyerId = req.user!.sub;
  const seen = new Set<string>();
  for (const i of items) {
    if (seen.has(i.ticketListingId)) {
      res.status(400).json({ error: "Duplicate listing in the same checkout" });
      return;
    }
    seen.add(i.ticketListingId);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      const createdOrderIds: string[] = [];

      for (const { ticketListingId, quantity } of items) {
        const listing = await tx.ticketListing.findUnique({
          where: { id: ticketListingId },
          include: { event: true },
        });
        if (!listing) {
          throw new Error(`Listing ${ticketListingId} not found`);
        }
        if (listing.sellerId === buyerId) {
          throw new Error("Cannot buy your own listing");
        }
        if (listing.quantity < quantity) {
          throw new Error(`Not enough tickets for listing ${listing.seatInfo || listing.id}`);
        }

        const unitAmount = listing.price.toNumber();
        const totalPrice = unitAmount * quantity;

        const order = await tx.order.create({
          data: {
            buyerId,
            ticketListingId,
            quantity,
            totalPrice: totalPrice,
            status: "PENDING",
          },
        });
        createdOrderIds.push(order.id);

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${listing.event.title} — ${listing.seatInfo || "General"}`,
              description: `Resale tickets (qty ${quantity})`,
            },
            unit_amount: Math.round(unitAmount * 100),
          },
          quantity,
        });
      }

      return { lineItems, createdOrderIds };
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: result.lineItems,
      success_url: `${frontendUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl()}/cart`,
      metadata: {
        orderIds: result.createdOrderIds.join(","),
        buyerId,
      },
    });

    await prisma.order.updateMany({
      where: { id: { in: result.createdOrderIds } },
      data: { stripeSessionId: session.id },
    });

    res.status(201).json({
      sessionId: session.id,
      url: session.url,
      orderIds: result.createdOrderIds,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    res.status(400).json({ error: message });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.sub },
    include: {
      listing: {
        include: { event: { select: { id: true, title: true, date: true, location: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

/** Orders where the authenticated user sold tickets (via listing). */
router.get("/sales", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { listing: { sellerId: req.user!.sub }, status: "PAID" },
    include: {
      buyer: { select: { id: true, email: true } },
      listing: { include: { event: { select: { id: true, title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

async function fulfillOrdersFromSession(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { ok: false, error: "Payment not completed" };
  }

  const orderIds = session.metadata?.orderIds?.split(",").filter(Boolean) ?? [];
  if (orderIds.length === 0) {
    return { ok: false, error: "No orders linked to session" };
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: { listing: true },
  });

  if (orders.length !== orderIds.length) {
    return { ok: false, error: "Order mismatch" };
  }

  await prisma.$transaction(async (tx) => {
    for (const order of orders) {
      if (order.status === "PAID") continue;

      const listing = await tx.ticketListing.findUnique({
        where: { id: order.ticketListingId },
      });
      if (!listing) throw new Error("Listing missing");
      if (listing.quantity < order.quantity) {
        throw new Error(`Insufficient stock for order ${order.id}`);
      }

      await tx.ticketListing.update({
        where: { id: order.ticketListingId },
        data: { quantity: { decrement: order.quantity } },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    }
  });

  return { ok: true };
}

/** Call after redirect from Stripe (or to poll payment state). */
router.get("/confirm", async (req, res) => {
  const sessionId = req.query.session_id as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: "session_id required" });
    return;
  }
  try {
    const result = await fulfillOrdersFromSession(sessionId);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Confirm failed";
    res.status(500).json({ error: message });
  }
});

router.put("/:id/pay", requireAuth, async (req, res) => {
  const parsed = paySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
  });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.buyerId !== req.user!.sub) {
    res.status(403).json({ error: "Not your order" });
    return;
  }
  if (!order.stripeSessionId || order.stripeSessionId !== parsed.data.sessionId) {
    res.status(400).json({ error: "Invalid session for this order" });
    return;
  }
  try {
    const result = await fulfillOrdersFromSession(parsed.data.sessionId);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const updated = await prisma.order.findUnique({
      where: { id: String(order.id) },
      include: { listing: { include: { event: true } } },
    });
    res.json({ order: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pay failed";
    res.status(500).json({ error: message });
  }
});

export default router;
