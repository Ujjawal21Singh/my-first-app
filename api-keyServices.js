const crypto = require("crypto");
const mongoose = require("mongoose");

// MongoDB Model for API Keys
const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

// Function to generate API Key
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex"); // 64-character API key
}

// Function to create and store API Key (expires in 30 minutes)
async function createApiKey(userId) {
  const apiKey = generateApiKey();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Set expiry time to 30 minutes

  await ApiKey.findOneAndUpdate({ userId }, { apiKey, expiresAt }, { upsert: true, new: true });
  return apiKey;
}

// Function to validate API Key (checks if expired)
async function validateApiKey(apiKey) {
  const key = await ApiKey.findOne({ apiKey });
  if (!key) return null;

  // Check if expired
  if (key.expiresAt < new Date()) {
    await ApiKey.deleteOne({ apiKey }); // Remove expired key
    return null;
  }
  return key.userId;
}

module.exports = { createApiKey, validateApiKey };
