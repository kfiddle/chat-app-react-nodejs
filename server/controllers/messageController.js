// controllers/messageController.js
const Message = require("../models/messageModel");
const { translate } = require("../services/translate");

// Get all messages (Ken & Julie thread)
module.exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });

    res.json(
      messages.map((msg) => ({
        id: msg._id,
        from: msg.from,               // "ken" or "julie"
        originalText: msg.originalText,
        translatedText: msg.translatedText,
        createdAt: msg.createdAt,
      }))
    );
  } catch (ex) {
    next(ex);
  }
};

// Add a new message (translate on the server)
module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, originalText } = req.body;
    console.log(from)
    console.log(originalText)

    if (!from || !originalText) {
      return res
        .status(400)
        .json({ msg: "Both 'from' and 'originalText' are required." });
    }

    // Call OpenAI via your translate service
    const translatedText = await translate({ from, text: originalText });
    console.log(translatedText)

    const data = await Message.create({
      from,           // "ken" or "julie"
      originalText,   // what was typed
      translatedText, // OpenAI output
    });

    if (!data) {
      return res
        .status(500)
        .json({ msg: "Failed to add message to the database" });
    }

    // Return full saved message so the client/socket can use it
    return res.json({
      msg: "Message added successfully.",
      message: {
        id: data._id,
        from: data.from,
        originalText: data.originalText,
        translatedText: data.translatedText,
        createdAt: data.createdAt,
      },
    });
  } catch (ex) {
    next(ex);
  }
};
