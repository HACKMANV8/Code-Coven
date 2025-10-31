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

// Function to send SMS alerts to all emergency contacts
export const sendSmsAlerts = async (location: { latitude: number; longitude: number }) => {
  try {
    // Get emergency contacts
    const contacts = await getEmergencyContacts();
    
    if (!contacts || contacts.length === 0) {
      throw new Error("No emergency contacts found");
    }
    
    // Send SMS to each contact
    const smsPromises = contacts.map(async (contact: EmergencyContact) => {
      try {
        const response = await fetch("http://localhost:5000/api/sms/emergency", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: contact.phone,
            name: contact.name,
            location: {
              latitude: location.latitude,
              longitude: location.longitude
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

// Enhanced alert function that sends both location to backend and SMS alerts
export const sendEmergencyAlert = async (location: { latitude: number; longitude: number }) => {
  try {
    // First, send location to backend
    await alertAPI.sendAlert({
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
      trigger: "emergency_button",
    });
    
    // Then send SMS alerts to emergency contacts
    const smsResult = await sendSmsAlerts(location);
    
    return {
      success: true,
      message: "Emergency alert sent successfully",
      smsResult
    };
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    throw error;
  }
};