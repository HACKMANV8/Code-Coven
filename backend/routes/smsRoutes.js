import express from "express";
import { sendEmergencySMS } from "../controllers/smsController.js";

const router = express.Router();

router.post("/emergency", sendEmergencySMS);

export default router;
