const express = require("express");
const app = express();
const PORT = process.env.PORT || 8888;

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(PORT, () => console.log("Server running"));
