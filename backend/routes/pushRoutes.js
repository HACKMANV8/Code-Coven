import express from "express";
import { getVapidKey, subscribeContact, sendEmergencyPush } from "../controllers/pushController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET VAPID public key (no auth needed)
router.get("/vapid-key", getVapidKey);

// POST subscribe contact for push (no auth needed for emergency)
router.post("/subscribe", subscribeContact);

// POST send emergency push alerts (optional auth)
router.post("/emergency", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  } else {
    req.user = null;
    next();
  }
}, sendEmergencyPush);

export default router;


