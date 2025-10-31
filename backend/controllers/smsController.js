import { sendEmergencyAlert } from '../services/smsService.js';
import Location from '../models/locationModel.js';

// POST send emergency SMS
export const sendEmergencySMS = async (req, res) => {
  try {
    const { phone, name, location } = req.body;
    // Use user info from middleware
    const userName = req.user?.name || 'Unknown User';

    if (!phone || !name) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide phone number and contact name" 
      });
    }

    // Save location to database if provided (with landmark data)
    let locationId = null;
    if (location && location.latitude && location.longitude) {
      const locationDoc = new Location({
        latitude: location.latitude,
        longitude: location.longitude,
        landmark: location.landmark || undefined
      });
      await locationDoc.save();
      locationId = locationDoc._id;
    }

    // Send emergency alert with location data
    const result = await sendEmergencyAlert(phone, name, userName, location);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Emergency alert sent successfully",
        sid: result.sid,
        status: result.status,
        locationId
      });
    } else if (result.simulated) {
      // Twilio not configured - simulation mode
      res.status(200).json({
        success: false,
        message: "SMS simulation mode (Twilio not configured)",
        simulated: true,
        error: result.error,
        missingVars: result.missingVars || [],
        instructions: "See backend/TWILIO_SETUP.md for configuration instructions",
        locationId
      });
    } else {
      // Twilio error (invalid number, unverified, etc.)
      res.status(400).json({
        success: false,
        message: "Failed to send SMS alert",
        error: result.error,
        code: result.code,
        locationId
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending SMS: " + error.message
    });
  }
};