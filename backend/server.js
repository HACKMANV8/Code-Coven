// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend server is running successfully!");
});

// Example API endpoint — Emergency contacts
app.get("/api/emergency-contacts", (req, res) => {
  const contacts = [
    { id: 1, name: "Mom", phone: "9876543210" },
    { id: 2, name: "Dad", phone: "9123456789" },
  ];
  res.json(contacts);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
