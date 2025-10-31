import { sendEmergencyAlert } from '../services/smsService.js';

// POST send emergency SMS
export const sendEmergencySMS = async (req, res) => {
  try {
    const { phone, name, userName } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide phone number and contact name" 
      });
    }

    const result = await sendEmergencyAlert(phone, name, userName);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Emergency alert sent successfully",
        sid: result.sid
      });
    } else if (result.simulated) {
      // Twilio not configured - simulation mode
      res.status(200).json({
        success: false,
        message: "SMS simulation mode (Twilio not configured)",
        simulated: true,
        error: result.error
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
