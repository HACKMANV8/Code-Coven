import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import contactRoutes from "./routes/contactRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import pushRoutes from "./routes/pushRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// routes
app.use("/api/alerts", alertRoutes);
app.use("/api/emergency-contacts", contactRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/push", pushRoutes);

// mongo connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));