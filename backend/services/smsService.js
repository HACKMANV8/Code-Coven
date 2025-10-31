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
    const missingVars = [];
    if (!process.env.TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID');
    if (!process.env.TWILIO_AUTH_TOKEN) missingVars.push('TWILIO_AUTH_TOKEN');
    if (!process.env.TWILIO_PHONE_NUMBER) missingVars.push('TWILIO_PHONE_NUMBER');
    
    console.log('⚠️  Twilio not configured - SMS simulation mode');
    console.log(`   Missing environment variables: ${missingVars.join(', ')}`);
    console.log('   See TWILIO_SETUP.md for configuration instructions');
    return { success: false, error: 'Twilio not configured', simulated: true, missingVars };
  }
  
  try {
    // Validate phone number format
    if (!to || !to.startsWith('+')) {
      return { 
        success: false, 
        error: `Invalid phone number format. Use E.164 format (e.g., +1234567890), got: ${to}` 
      };
    }

    const result = await client.messages.create({
      body: message,
      to: to.trim(),
      from: process.env.TWILIO_PHONE_NUMBER.trim()
    });
    
    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    console.log(`   Status: ${result.status}, Price: ${result.price || 'N/A'}`);
    return { 
      success: true, 
      sid: result.sid,
      status: result.status,
      price: result.price
    };
  } catch (error) {
    console.error(`❌ SMS error to ${to}:`, error.message);
    
    // Provide helpful error messages
    let userFriendlyError = error.message;
    if (error.code === 21211) {
      userFriendlyError = 'Invalid phone number format. Use E.164 format (e.g., +1234567890)';
    } else if (error.code === 21608) {
      userFriendlyError = 'Phone number not verified. Add it to Twilio Console (required for trial accounts)';
    } else if (error.code === 21614) {
      userFriendlyError = 'Invalid Twilio phone number';
    }
    
    return { success: false, error: userFriendlyError, code: error.code };
  }
};

export const sendEmergencyAlert = async (contactPhone, contactName, userName, locationData = null) => {
  // Build location information
  let locationInfo = '';
  
  if (locationData) {
    const { latitude, longitude, landmark } = locationData;
    
    if (landmark && (landmark.fullAddress || landmark.displayName)) {
      // Use landmark/address if available
      const address = landmark.fullAddress || landmark.displayName;
      locationInfo = `📍 Location: ${address}\n📌 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
      
      // Add Google Maps link for easy navigation
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      locationInfo += `🗺️ Maps: ${mapsLink}\n`;
    } else if (latitude && longitude) {
      // Fallback to coordinates if no landmark available
      locationInfo = `📍 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      locationInfo += `🗺️ Maps: ${mapsLink}\n`;
    }
  } else {
    locationInfo = '📍 Location: Not available\n';
  }

  const message = `🚨 EMERGENCY ALERT 🚨\n\n${userName || 'A SafeLink user'} needs help immediately!\n\n${locationInfo}\n⚠️ This is an automated emergency alert. Please respond or call emergency services if needed.\n\nIf this is a false alarm, please inform ${userName || 'the user'}.\n\n-Stay Safe, SafeLink`;

  return await sendSMS(contactPhone, message);
};
