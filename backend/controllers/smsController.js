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

    // Save location to database if provided
    let locationId = null;
    if (location && location.latitude && location.longitude) {
      const locationDoc = new Location({
        latitude: location.latitude,
        longitude: location.longitude
      });
      await locationDoc.save();
      locationId = locationDoc._id;
    }

    const result = await sendEmergencyAlert(phone, name, userName);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Emergency alert sent successfully",
        sid: result.sid,
        locationId
      });
    } else if (result.simulated) {
      // Twilio not configured - simulation mode
      res.status(200).json({
        success: false,
        message: "SMS simulation mode (Twilio not configured)",
        simulated: true,
        error: result.error,
        locationId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send alert",
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending SMS: " + error.message
    });
  }
};