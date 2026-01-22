const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Create express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "1kb" }));
app.use(helmet());

// Example route
app.get("/", (req, res) => {
  res.json({
    message: "✅ Server MrBlack is connected! Working as well!",
    timestamp: new Date().toISOString(),
    success: true,
  });
});

// Export as Vercel serverless function
module.exports = app;
