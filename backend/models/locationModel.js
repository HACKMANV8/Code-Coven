import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  altitude: Number,
  altitudeAccuracy: Number,
  heading: Number,
  speed: Number,
  // Landmark/Address information
  landmark: {
    address: String,
    displayName: String,
    building: String,
    road: String,
    suburb: String,
    city: String,
    state: String,
    country: String,
    postcode: String,
    fullAddress: String,
  },
  // Heart rate data (if available during emergency)
  heartRate: {
    bpm: Number,
    status: String, // normal, mild_high, high, extreme_high, mild_low, extreme_low
    source: String, // sensor, camera, bluetooth, estimated
    timestamp: Date,
  },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Location", locationSchema);