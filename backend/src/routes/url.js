import express from "express";
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const router = express.Router();
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

router.post("/shorten", async (req, res) => {
    const { longUrl } = req.body;

    // Check if URL already shortened
    let existing = await prisma.url.findUnique({ where: { longUrl }});
    if (existing) return res.json({ shortCode: existing.shortCode });

    const shortCode = nanoid();
    const newUrl = await prisma.url.create({ data: { longUrl, shortCode }});
    res.json({ shortCode: newUrl.shortCode });
});

export default router;
