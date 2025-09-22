import express from "express";
import validator from "validator";
import { customAlphabet } from "nanoid";
import { prisma } from "../lib/database.js";

const router = express.Router();
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

// Input validation middleware
const validateUrl = (req, res, next) => {
    const { longUrl } = req.body;
    
    if (!longUrl) {
        return res.status(400).json({ 
            error: 'Bad Request', 
            message: 'URL is required' 
        });
    }
    
    if (typeof longUrl !== 'string' || longUrl.length > 2048) {
        return res.status(400).json({ 
            error: 'Bad Request', 
            message: 'URL must be a string with maximum 2048 characters' 
        });
    }
    
    // Normalize URL - add protocol if missing
    let normalizedUrl = longUrl.trim();
    if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    
    if (!validator.isURL(normalizedUrl, { 
        protocols: ['http', 'https'], 
        require_protocol: true,
        require_valid_protocol: true,
        allow_underscores: false,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false
    })) {
        return res.status(400).json({ 
            error: 'Bad Request', 
            message: 'Please provide a valid URL' 
        });
    }
    
    // Store normalized URL
    req.body.longUrl = normalizedUrl;
    next();
};

router.post("/shorten", validateUrl, async (req, res) => {
    try {
        const { longUrl } = req.body;

        // Check if URL already shortened
        let existing = await prisma.url.findUnique({ 
            where: { longUrl }
        });
        
        if (existing) {
            return res.json({ 
                shortCode: existing.shortCode,
                message: 'URL was already shortened',
                existing: true
            });
        }

        // Generate unique short code
        let shortCode;
        let attempts = 0;
        const maxAttempts = 5;
        
        do {
            shortCode = nanoid();
            const existingCode = await prisma.url.findUnique({ 
                where: { shortCode } 
            });
            if (!existingCode) break;
            attempts++;
        } while (attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            return res.status(500).json({ 
                error: 'Internal Server Error', 
                message: 'Unable to generate unique short code' 
            });
        }

        const newUrl = await prisma.url.create({ 
            data: { longUrl, shortCode }
        });
        
        res.status(201).json({ 
            shortCode: newUrl.shortCode,
            longUrl: newUrl.longUrl,
            message: 'URL shortened successfully',
            existing: false
        });
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to shorten URL' 
        });
    }
});

// Get all URLs with their statistics
router.get("/stats", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;
        
        const [urls, total] = await Promise.all([
            prisma.url.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.url.count()
        ]);
        
        // Calculate summary statistics
        const totalClicks = await prisma.url.aggregate({
            _sum: { clicks: true }
        });
        
        res.json({
            data: urls,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            summary: {
                totalUrls: total,
                totalClicks: totalClicks._sum.clicks || 0,
                averageClicks: total > 0 ? ((totalClicks._sum.clicks || 0) / total) : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching URL statistics:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to fetch URL statistics' 
        });
    }
});

// Get specific URL statistics
router.get("/stats/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        if (!shortCode || shortCode.length !== 6) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Invalid short code format' 
            });
        }
        
        const url = await prisma.url.findUnique({
            where: { shortCode }
        });
        
        if (!url) {
            return res.status(404).json({ 
                error: 'Not Found', 
                message: 'URL not found' 
            });
        }
        
        res.json(url);
        
    } catch (error) {
        console.error('Error fetching URL statistics:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to fetch URL statistics' 
        });
    }
});

export default router;
