import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log("🚨 Alert received:", latitude, longitude);

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing location data" });
    }

    // Just confirming the alert works
    res.status(200).json({ message: "Alert received successfully!" });
  } catch (error) {
    console.error("❌ Error handling alert:", error);
    res.status(500).json({ error: "Failed to handle alert" });
  }
});

export default router;
