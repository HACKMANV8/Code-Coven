import { alertAPI } from "@/lib/api";

// Define interface for contact
interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relation: string;
}

// Function to get emergency contacts
export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  try {
    const response = await fetch("http://localhost:5000/api/emergency-contacts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    throw error;
  }
};

// Function to send Push Notifications to all emergency contacts (NO CREDENTIALS NEEDED!)
export const sendPushAlerts = async (location: { 
  latitude: number; 
  longitude: number; 
  landmark?: any;
  heartRate?: any;
}) => {
  try {
    // Send push notification to all subscribed contacts
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("http://localhost:5000/api/push/emergency", {
      method: "POST",
      headers,
      body: JSON.stringify({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          landmark: location.landmark || undefined,
          heartRate: location.heartRate || undefined
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send push notifications: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error sending push alerts:", error);
    throw error;
  }
};

// Function to send SMS alerts (fallback, requires Twilio)
export const sendSmsAlerts = async (location: { 
  latitude: number; 
  longitude: number; 
  landmark?: any;
  heartRate?: any;
}) => {
  try {
    // Get emergency contacts
    const contacts = await getEmergencyContacts();
    
    if (!contacts || contacts.length === 0) {
      throw new Error("No emergency contacts found");
    }
    
    // Send SMS to each contact
    const smsPromises = contacts.map(async (contact: EmergencyContact) => {
      try {
        // Get auth token from localStorage if available
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        // Add auth token if available
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("http://localhost:5000/api/sms/emergency", {
          method: "POST",
          headers,
          body: JSON.stringify({
            phone: contact.phone,
            name: contact.name,
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              landmark: location.landmark || undefined,
              heartRate: location.heartRate || undefined
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to send SMS to ${contact.name}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error sending SMS to ${contact.name}:`, error);
        return { success: false, error: (error as Error).message };
      }
    });
    
    // Wait for all SMS to be sent
    const results = await Promise.all(smsPromises);
    
    return {
      success: true,
      message: `Sent alerts to ${results.filter(r => r.success).length} of ${contacts.length} contacts`,
      results
    };
  } catch (error) {
    console.error("Error sending SMS alerts:", error);
    throw error;
  }
};

// Enhanced alert function - uses Push Notifications (NO CREDENTIALS NEEDED!)
// Falls back to SMS if push fails or not available
export const sendEmergencyAlert = async (location: { 
  latitude: number; 
  longitude: number; 
  landmark?: any;
  heartRate?: any;
}) => {
  try {
    // First, send location to backend (with heart rate if available)
    await alertAPI.sendAlert({
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
      trigger: "emergency_button",
      heartRate: location.heartRate || undefined,
    });
    
    // Try push notifications first (no credentials needed!)
    let pushResult = null;
    try {
      pushResult = await sendPushAlerts(location);
      console.log("✅ Push notifications sent:", pushResult);
    } catch (pushError) {
      console.warn("Push notifications failed, trying SMS fallback:", pushError);
      // Fallback to SMS if push fails
      try {
        const smsResult = await sendSmsAlerts(location);
        return {
          success: true,
          message: "Emergency alert sent via SMS (push notifications unavailable)",
          method: "sms",
          smsResult
        };
      } catch (smsError) {
        console.error("Both push and SMS failed:", smsError);
        throw new Error("Failed to send emergency alerts");
      }
    }
    
    return {
      success: true,
      message: "Emergency alert sent successfully via push notifications",
      method: "push",
      pushResult
    };
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    throw error;
  }
};