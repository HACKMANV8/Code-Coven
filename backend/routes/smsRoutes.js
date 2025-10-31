import express from "express";
import { sendEmergencySMS } from "../controllers/smsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/emergency", authMiddleware, sendEmergencySMS);

export default router;