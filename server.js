const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { createApiKey, validateApiKey, expireApiKey } = require("./apiKeyService");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for frontend access

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Signup Endpoint
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    // Hash password and store
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Middleware for authentication using JWT
function authenticateUser(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
}

// Endpoint to generate API Key (Authenticated users only)
app.post("/generate-api-key", authenticateUser, async (req, res) => {
  try {
    const apiKey = await createApiKey(req.userId);
    res.json({ success: true, apiKey, expiresIn: "30 minutes" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating API Key" });
  }
});

// Middleware to authenticate requests using API Key
async function apiAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "API Key required" });

  const userId = await validateApiKey(apiKey);
  if (!userId) return res.status(403).json({ error: "Invalid or expired API Key" });

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

