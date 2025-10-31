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
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Location", locationSchema);