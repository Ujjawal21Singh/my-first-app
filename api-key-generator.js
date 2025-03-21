const crypto = require("crypto");
const mongoose = require("mongoose");

// MongoDB Model for API Keys
const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true },
});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

// Function to generate API Key
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex"); // 64-character API key
}

// Function to create and store API Key
async function createApiKey(userId) {
  const apiKey = generateApiKey();
  await ApiKey.findOneAndUpdate({ userId }, { apiKey }, { upsert: true, new: true });
  return apiKey;
}

// Function to validate API Key
async function validateApiKey(apiKey) {
  const key = await ApiKey.findOne({ apiKey });
  return key ? key.userId : null;
}

module.exports = { createApiKey, validateApiKey };
