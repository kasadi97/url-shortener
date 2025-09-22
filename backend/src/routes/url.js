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

// Get all URLs with their statistics
router.get("/stats", async (req, res) => {
    try {
        const urls = await prisma.url.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(urls);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch URL statistics" });
    }
});

// Get specific URL statistics
router.get("/stats/:shortCode", async (req, res) => {
    try {
        const url = await prisma.url.findUnique({
            where: { shortCode: req.params.shortCode }
        });
        if (!url) return res.status(404).json({ error: "URL not found" });
        res.json(url);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch URL statistics" });
    }
});

export default router;
