// backend/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";

dotenv.config(); // Load environment variables
console.log("🧩 MONGO_URI from .env:", process.env.MONGO_URI);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/emergency-contacts", contactRoutes);
app.use("/api/sms", smsRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully!");
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
