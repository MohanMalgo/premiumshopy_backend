import { Server } from "socket.io";
import Event from "./models/events.js";
import User from "./models/user.js";
export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"], // Use WebSocket transport
    pingInterval: 10000, // Ping interval (in ms)
    pingTimeout: 5000, // Ping timeout (in ms)
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a chat room
    socket.on("joinRoom", async ({ userId, eventId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        const organizerId = event.createdBy;
        if (!organizerId) throw new Error("Organizer not found");

        const room = [userId, organizerId.toString()].sort().join("_");
        socket.join(room);

        console.log(`User ${userId} joined room: ${room}`);
        socket.emit("roomJoined", { room });
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "An error occurred in joinRoom" });
      }
    });

    // User sends a message
    socket.on("sendMessage", async ({ senderId, eventId, message }) => {
      try {
        const user = await User.findById(senderId);
        if (!user) return socket.emit("error", { message: "User not found" });

        const event = await Event.findById(eventId);
        if (!event) return socket.emit("error", { message: "Event not found" });

        const receiverId = event.createdBy; // Organizer ID
        const room = [senderId, receiverId.toString()].sort().join("_");

        const newMessage = {
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        };

        // Store message in event schema
        event.chats = event.chats || [];
        event.chats.push(newMessage);
        await event.save();

        io.to(room).emit("receiveMessage", newMessage);

        console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });
};

