import express from "express";
import http from "http"; // Import HTTP module
import { Server } from "socket.io"; // Import socket.io
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import routes from "./routes/index.js";
import { BACKEND_PORT } from "./config/index.js";
import fileUpload from "express-fileupload";
// import User from "./models/user.js";
import events from "./models/events.js";
// import { setupSocket } from "./socket.js"; // Import socket setup

dotenv.config();
connectDB();
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // Force WebSocket transport
});


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(fileUpload());
app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Welcome to the Watch API server!");
});
// setupSocket(server);

app.set("io", io);


const users = {}; // To store connected users   nc localhost 3006

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // User joins a chat room
//   socket.on("joinRoom", async ({ userId, eventId }) => {
//     console.log("Joining room with:", userId, eventId);

//     try {
//       const user = await User.findById(userId);
//       if (!user) throw new Error("User not found");

//       const event = await Event.findById(eventId);
//       if (!event) throw new Error("Event not found");

//       const organizerId = event.createdBy;
//       if (!organizerId) throw new Error("Organizer not found");

//       const room = [userId, organizerId.toString()].sort().join("_");
//       socket.join(room);

//       console.log(`User ${userId} joined room: ${room}`);
//       socket.emit("roomJoined", { room });
//     } catch (error) {
//       console.error("Join room error:", error);
//       socket.emit("error", { message: "An error occurred in joinRoom" });
//     }
//   });

//   // User sends a message
//   socket.on("sendMessage", async ({ senderId, eventId, message }) => {
//     try {
//       const user = await User.findById(senderId);
//       if (!user) return socket.emit("error", { message: "User not found" });

//       const event = await Event.findById(eventId);
//       if (!event) return socket.emit("error", { message: "Event not found" });

//       const receiverId = event.createdBy; // Organizer ID
//       const room = [senderId, receiverId.toString()].sort().join("_");

//       const newMessage = {
//         senderId,
//         receiverId,
//         message,
//         timestamp: new Date(),
//       };

//       // Store message in event schema
//       event.chats = event.chats || [];
//       event.chats.push(newMessage);
//       await event.save();

//       io.to(room).emit("receiveMessage", newMessage);

//       console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       socket.emit("error", { message: "Failed to send message" });
//     }
//   });

//   // Handle user disconnection
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
//   socket.on('error', (err) => {
//     console.error('Socket error:', err);
//   });
// });

io.on("connection", (socket) => {

  
  socket.on("joinRoom",async ({ userId, eventId }) => {
    
    const roomId = `12345_${eventId}`;
    socket.join(roomId);
    const event = await events.findById(eventId);

    const chatHistory = await event.chats.filter(chat => chat.roomId === roomId);
    socket.emit("previousMessages", {success: true,chats:chatHistory});
    
  });
  socket.on("sendMessage", async ({ senderId, receiverId, message, eventId }) => {
    try {
      if (!senderId || !receiverId || !message || !eventId) {
        return;
      }

      const event = await events.findById(eventId);
      if (!event) return;

      // let roomId = [senderId, receiverId, eventId].sort().join("_");
      const roomId = `12345_${eventId}`;
      const newMessage = {
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
        roomId,
      };

      event.chats.push(newMessage);
      await event.save();
      const updatedChatHistory = event.chats.filter(chat => chat.roomId === roomId);

      // io.to(roomId).emit("newMessage", newMessage); // Emit to the correct room
      io.to(roomId).emit("newMessage", {
        // newMessage,
        success: true,
        chats: updatedChatHistory
      });
      console.log(`📩 Message sent to Room: ${roomId}`, updatedChatHistory);
    } catch (error) {
      console.error("❌ Error handling sendMessage:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected=================");
  });
});
const PORT = process.env.PORT || BACKEND_PORT || 10000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





// io.on("connection", (socket) => {
//   console.log(`⚡ User Connected: ${socket.id}`);

//   socket.on("joinRoom", ({ userId, eventId }) => {
//     if (!userId || !eventId) {
//       console.log("⚠️ Invalid joinRoom data:", { userId, eventId });
//       return;
//     }
//     const roomId = `${userId}_${eventId}`; // Standardized format
//     socket.join(roomId);
//     console.log(`👥 User ${userId} joined room: ${roomId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ User Disconnected:", socket.id);
//   });
// });