const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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

const corsOptions = {
    origin: ['https://volinipriya06.github.io', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions)); 

app.use(express.json());

app.use(
    express.static(
        path.join(
            __dirname,
            "../docs"
        )
    )
);

connectDatabase();

function parseAuthToken(req, res, next) {
    const header = req.headers["authorization"];

    if (!header) {
        req.user = null;
        return next();
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "super_secure_telemetry_jwt_token_key_1101"
        );
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
}

app.post(
    "/api/auth/register",
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const exists = await User.findOne({ email });
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists."
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                name,
                email,
                password: hashedPassword
            });

            await newUser.save();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);

app.post(
    "/api/auth/login",
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    message: "Invalid credentials."
                });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).json({
                    message: "Invalid credentials."
                });
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name
                },
                process.env.JWT_SECRET || "super_secure_telemetry_jwt_token_key_1101",
                { expiresIn: "24h" }
            );

            res.json({
                token,
                user: {
                    name: user.name,
                    email: user.email
                }
            });
        } catch (err) {
            res.status(500).json({
                message: err.message
            });
        }
    }
);

app.get(
    "/api/brands/:brandName",
    parseAuthToken,
    async (req, res) => {
        try {
            const { brandName } = req.params;
            const webData = await scrapeBrandData(brandName);

            console.log(webData);

            const aiAnalysis = await analyzeWithAI(brandName, webData);

            const historyEntry = new SearchHistory({
                query: brandName,
                status:
                    aiAnalysis.ethicalScore >= 70
                    ? "ETHICAL"
                    : aiAnalysis.ethicalScore >= 40
                    ? "WARNING"
                    : "UNETHICAL",
                userId: req.user ? (req.user.id || req.user._id) : null
            });

            await historyEntry.save();
            console.log("HISTORY SAVED");

            res.json({
                success: true,
                source: "live_ai_analysis",
                brand: aiAnalysis
            });
        } catch (error) {
            console.log("AI ERROR:", error);
            res.status(500).json({
                success: false,
                message: "AI analysis failed"
            });
        }
    }
);

app.get(
    "/api/history",
    parseAuthToken,
    async (req, res) => {
        try {
            const filter = req.user
                ? { userId: (req.user.id || req.user._id) }
                : { userId: null };

            const history = await SearchHistory.find(filter).sort({
                createdAt: -1
            });

            res.json(history);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "History fetch failed"
            });
        }
    }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});
