const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    from: {
      type: String, // "ken" or "julie"
      required: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    translatedText: {
      type: String, // after OpenAI translation
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
