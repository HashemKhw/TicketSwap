import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  location: z.string().min(1),
  date: z.string().datetime(),
  imageUrl: z.string().url().optional().or(z.literal("")).transform((value) => value || undefined),
});

router.get("/", async (_req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      _count: { select: { listings: true } },
    },
  });
  res.json({ events });
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      listings: {
        where: { quantity: { gt: 0 } },
        include: {
          seller: { select: { id: true, email: true } },
        },
        orderBy: { price: "asc" },
      },
    },
  });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json({ event });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { title, description, location, date, imageUrl } = parsed.data;
  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date: new Date(date),
      imageUrl,
    },
  });
  res.status(201).json({ event });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = createEventSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;
  try {
    const event = await prisma.event.update({
      where: { id: String(req.params.id) },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
      },
    });
    res.json({ event });
  } catch {
    res.status(404).json({ error: "Event not found" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Event not found" });
  }
});

export default router;
