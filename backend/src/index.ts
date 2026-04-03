import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import ticketsRoutes from "./routes/tickets.js";
import ordersRoutes from "./routes/orders.js";
import uploadsRoutes from "./routes/uploads.js";
import { ensureStorageBuckets } from "./lib/storage.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string) {
  if (corsOrigins.includes(origin)) return true;
  return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !corsOrigins.length || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/events", eventsRoutes);
app.use("/tickets", ticketsRoutes);
app.use("/orders", ordersRoutes);
app.use("/uploads", uploadsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

ensureStorageBuckets();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
