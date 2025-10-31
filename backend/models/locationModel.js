import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  altitude: Number,
  altitudeAccuracy: Number,
  heading: Number,
  speed: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Location", locationSchema);