import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadBufferToBucket } from "../lib/storage.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function requireSingleFile(file: Express.Multer.File | undefined) {
  if (!file) {
    throw new Error("File is required");
  }
  return file;
}

router.post("/event-image", requireAuth, requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const file = requireSingleFile(req.file);
    const asset = await uploadBufferToBucket({
      bucket: "event-images",
      buffer: file.buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
      ownerId: req.user!.sub,
    });
    res.status(201).json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    res.status(400).json({ error: message });
  }
});

router.post("/ticket-pdf", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const file = requireSingleFile(req.file);
    const asset = await uploadBufferToBucket({
      bucket: "ticket-pdfs",
      buffer: file.buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
      ownerId: req.user!.sub,
    });
    res.status(201).json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    res.status(400).json({ error: message });
  }
});

router.post("/transfer-proof", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const file = requireSingleFile(req.file);
    const asset = await uploadBufferToBucket({
      bucket: "transfer-proofs",
      buffer: file.buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
      ownerId: req.user!.sub,
    });
    res.status(201).json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    res.status(400).json({ error: message });
  }
});

export default router;
