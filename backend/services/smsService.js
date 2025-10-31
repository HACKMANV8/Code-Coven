import twilio from 'twilio';

// Check if Twilio is configured
const isTwilioConfigured = () => {
  return process.env.TWILIO_ACCOUNT_SID && 
         process.env.TWILIO_AUTH_TOKEN && 
         process.env.TWILIO_PHONE_NUMBER;
};

// Initialize Twilio client only if configured
const getTwilioClient = () => {
  if (!isTwilioConfigured()) {
    return null;
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

export const sendSMS = async (to, message) => {
  const client = getTwilioClient();
  
  if (!client) {
    console.log('⚠️  Twilio not configured - SMS simulation mode');
    return { success: false, error: 'Twilio not configured', simulated: true };
  }
  
  try {
    const result = await client.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendEmergencyAlert = async (contactPhone, contactName, userName) => {
  const message = `🚨 EMERGENCY ALERT 🚨\n\nThis is an emergency alert from ${userName || 'SafeLink'}. Their location has been shared. Please respond immediately if this is a false alarm.\n\n-Stay Safe, SafeLink`;
  
  return await sendSMS(contactPhone, message);
};
