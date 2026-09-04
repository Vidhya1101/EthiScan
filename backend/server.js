const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectDatabase = require("./db/connection");
const User = require("./models/User");
const SearchHistory = require("./models/SearchHistory");
const scrapeBrandData = require("./services/webScraper");
const analyzeWithAI = require("./services/aiAnalyzer");
const app = express();
const allowedOrigins = [
    "https://vidhya1101.github.io",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "online",
        database: mongoose.connection.readyState === 1 ? "connected" : "connecting"
    });
});
app.use(express.static(path.join(__dirname, "../docs")));
connectDatabase().catch(error => {
    console.error("Database startup error:", error.message);
});
function parseAuthToken(req, res, next) {
    const header = req.headers["authorization"];
    if (!header) {
        req.user = null;
        return next();
    }
    const parts = header.split(" ");
    const token = parts.length === 2 ? parts[1] : null;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET || "super_secure_telemetry_jwt_token_key_1101"
        );
    } catch (err) {
        req.user = null;
    }
    next();
}
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required." });
        }
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ name, email, password: hashedPassword }).save();
        res.json({ success: true });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ success: false, message: "Registration failed." });
    }
});
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials." });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials." });
        const token = jwt.sign(
            { id: user._id.toString(), name: user.name },
            process.env.JWT_SECRET || "super_secure_telemetry_jwt_token_key_1101",
            { expiresIn: "24h" }
        );
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Login failed." });
    }
});
app.get("/api/brands/:brandName", parseAuthToken, async (req, res) => {
    try {
        const brandName = decodeURIComponent(req.params.brandName);
        const webData = await scrapeBrandData(brandName);
        const aiAnalysis = await analyzeWithAI(brandName, webData);
        const score = Number(aiAnalysis.ethicalScore) || 0;
        await new SearchHistory({
            query: brandName,
            status: score >= 70 ? "ETHICAL" : score >= 40 ? "WARNING" : "UNETHICAL",
            userId: req.user ? req.user.id : null
        }).save();
        res.json({ success: true, source: "live_ai_analysis", brand: aiAnalysis });
    } catch (error) {
        console.error("BRAND ANALYSIS ERROR:", error);
        res.status(500).json({ success: false, message: "AI analysis failed. Please try again." });
    }
});
app.get("/api/history", parseAuthToken, async (req, res) => {
    try {
        const filter = req.user ? { userId: req.user.id } : { userId: null };
        const history = await SearchHistory.find(filter).sort({ createdAt: -1 }).limit(200).lean();
        res.json(history);
    } catch (error) {
        console.error("HISTORY ERROR:", error);
        res.status(500).json({ message: "History fetch failed" });
    }
});
app.delete("/api/history", parseAuthToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const result = await SearchHistory.deleteMany({ userId: req.user.id });
        res.json({ success: true, message: "Search history cleared successfully.", deletedCount: result.deletedCount });
    } catch (error) {
        console.error("CLEAR HISTORY ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to clear search history." });
    }
});
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`EthiScan server running on port ${PORT}`);
});
server.on("error", error => {
    console.error("SERVER ERROR:", error);
});
