import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import urlRoutes from "./routes/url.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/url", urlRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, "../../public")));

app.get("/:code", async (req, res) => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const url = await prisma.url.findUnique({ where: { shortCode: req.params.code }});
    if (!url) return res.status(404).send("URL not found");
    
    // Increment click count
    await prisma.url.update({
        where: { shortCode: req.params.code },
        data: { clicks: { increment: 1 } }
    });
    
    res.redirect(url.longUrl);
});

app.listen(5000, () => console.log("Server running on port 5000"));
