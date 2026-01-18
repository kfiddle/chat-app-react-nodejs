const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");

// CORS configuration for Express
const allowedOrigins = [
  "http://localhost:3000",  // Local dev
  process.env.FRONTEND_URL, // Production Firebase URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

// Socket.io CORS configuration
const io = socket(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

console.log(`Socket.io configured with allowed origins:`, allowedOrigins);

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`\n===== NEW SOCKET CONNECTION =====`);
  console.log(`Socket ID: ${socket.id}`);
  console.log(`Origin: ${socket.handshake.headers.origin}`);
  console.log(`=================================\n`);

  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`\n>>> USER ADDED <<<`);
    console.log(`User ID: ${userId}`);
    console.log(`Socket ID: ${socket.id}`);
    console.log(`Total online users:`, Array.from(onlineUsers.entries()));
    console.log(`==================\n`);
  });

  socket.on("send-msg", (data) => {
    console.log(`\n>>> MESSAGE RECEIVED <<<`);
    console.log(`From: ${data.from}`);
    console.log(`Data:`, JSON.stringify(data, null, 2));

    try {
      const recipient = data.from === "ken" ? "julie" : "ken";
      const recipientSocketId = onlineUsers.get(recipient);

      console.log(`Recipient: ${recipient}`);
      console.log(`Recipient socket ID: ${recipientSocketId}`);
      console.log(`Current online users:`, Array.from(onlineUsers.entries()));

      if (recipientSocketId) {
        const messageToSend = {
          from: data.from,
          originalText: data.originalText,
          translatedText: data.translatedText,
          createdAt: data.createdAt,
        };

        socket.to(recipientSocketId).emit("msg-recieve", messageToSend);
        console.log(`✓ Message sent to ${recipient}`);
        console.log(`Message content:`, JSON.stringify(messageToSend, null, 2));
      } else {
        console.log(`✗ Recipient ${recipient} NOT found in online users`);
      }
    } catch (error) {
      console.error("Socket send-msg error:", error);
    }
    console.log(`========================\n`);
  });

  socket.on("disconnect", () => {
    console.log(`\n>>> DISCONNECT <<<`);
    console.log(`Socket ID: ${socket.id}`);

    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} removed`);
        console.log(`Remaining online users:`, Array.from(onlineUsers.keys()));
        break;
      }
    }
    console.log(`==================\n`);
  });
});
