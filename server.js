const express = require("express");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(express.json({ limit: "1kb" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "✅ Server MrBlack is connected! Working as well!",
    timestamp: new Date().toISOString(),
    success: true,
  });
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}`);
});
