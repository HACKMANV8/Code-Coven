import express from "express";
import Location from "../models/locationModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      accuracy, 
      altitude, 
      altitudeAccuracy, 
      heading, 
      speed,
      landmark 
    } = req.body;
    
    if (!latitude || !longitude)
      return res.status(400).json({ error: "Missing coordinates" });

    // Save location to database with optional landmark data
    const locationData = { 
      latitude, 
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed
    };

    // Add landmark data if provided
    if (landmark) {
      locationData.landmark = landmark;
    }

    const location = new Location(locationData);
    await location.save();

    const landmarkInfo = landmark?.fullAddress || landmark?.displayName || 'No landmark data';
    console.log("📍 Saved location:", latitude, longitude, `- ${landmarkInfo}`);
    
    res.status(200).json({ 
      message: "Location received and saved", 
      locationId: location._id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all locations (for debugging/history)
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;