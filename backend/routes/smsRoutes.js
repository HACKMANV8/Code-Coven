import express from "express";
import { sendEmergencySMS } from "../controllers/smsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Make auth optional for emergency SMS - allows sending even without login
// The controller will handle missing user info gracefully
router.post("/emergency", (req, res, next) => {
  // Try to authenticate, but don't block if it fails
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Has token, use auth middleware
    return authMiddleware(req, res, next);
  } else {
    // No token, continue without user info
    req.user = null;
    next();
  }
}, sendEmergencySMS);

export default router;