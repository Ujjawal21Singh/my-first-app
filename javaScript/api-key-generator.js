const crypto = require("crypto");
const mongoose = require("mongoose");

// MongoDB Model for API Keys
const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }, // Expiration time
});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

// Function to generate API Key
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex"); // 64-character API key
}

// Function to create and store API Key with expiration (30 min)
async function createApiKey(userId) {
  const apiKey = generateApiKey();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

  await ApiKey.findOneAndUpdate(
    { userId },
    { apiKey, expiresAt },
    { upsert: true, new: true }
  );

  return { apiKey, expiresAt };
}

// Function to validate API Key
async function validateApiKey(apiKey) {
  const key = await ApiKey.findOne({ apiKey });

  if (!key) return null;

  // Check expiration
  if (new Date() > key.expiresAt) {
    await ApiKey.deleteOne({ apiKey }); // Remove expired key
    return null;
  }

  return key.userId;
}

module.exports = { createApiKey, validateApiKey };

