import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
import { prisma } from "./lib/database.js";
import urlRoutes from "./routes/url.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for frontend
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"], // Allow AJAX requests to same origin
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

const shortenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 URL shortening requests per windowMs
    message: "Too many URL shortening requests, please try again later.",
});

app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: 'Connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'Error',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: error.message
        });
    }
});

// API routes with rate limiting for shortening
app.use("/api/url/shorten", shortenLimiter);
app.use("/api/url", urlRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, "../../public")));

// Serve stats page
app.get("/stats", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/stats.html"));
});

// URL redirect endpoint with error handling
app.get("/:code", async (req, res) => {
    try {
        const { code } = req.params;
        
        // Basic validation
        if (!code || code.length !== 6) {
            return res.status(400).send("Invalid short code format");
        }

        const url = await prisma.url.findUnique({ 
            where: { shortCode: code }
        });
        
        if (!url) {
            return res.status(404).send("URL not found");
        }
        
        // Increment click count
        await prisma.url.update({
            where: { shortCode: code },
            data: { clicks: { increment: 1 } }
        });
        
        res.redirect(301, url.longUrl);
    } catch (error) {
        console.error('Error processing redirect:', error);
        res.status(500).send("Internal server error");
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested resource was not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Prisma error handling
    if (error.code === 'P2002') {
        return res.status(409).json({ 
            error: 'Conflict', 
            message: 'Resource already exists' 
        });
    }
    
    if (error.code && error.code.startsWith('P')) {
        return res.status(400).json({ 
            error: 'Database Error', 
            message: 'Invalid request data' 
        });
    }
    
    // Default error response
    const statusCode = error.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message;
    
    res.status(statusCode).json({
        error: 'Server Error',
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});
