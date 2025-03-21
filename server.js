const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createApiKey, validateApiKey } = require("./apiKeyService");

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Endpoint to generate API Key (for authenticated users)
app.post("/generate-api-key", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  const apiKey = await createApiKey(userId);
  res.json({ apiKey });
});

// Middleware to authenticate requests using API Key
async function apiAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "API Key required" });

  const userId = await validateApiKey(apiKey);
  if (!userId) return res.status(403).json({ error: "Invalid API Key" });

  req.userId = userId;
  next();
}

// Example protected route
app.get("/protected-data", apiAuth, (req, res) => {
  res.json({ message: "Welcome! You accessed a protected route.", userId: req.userId });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
