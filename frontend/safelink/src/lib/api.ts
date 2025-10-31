// Device API
import { apiCall } from "./apiCall";

// 🧩 Device-related API calls
export const deviceAPI = {
  connect: async (deviceData: {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    macAddress: string;
  }) => {
    return apiCall("/devices/connect", {
      method: "POST",
      body: JSON.stringify(deviceData),
    });
  },

  getConnected: async () => {
    return apiCall("/devices/connected");
  },

  disconnect: async (deviceId: string) => {
    return apiCall(`/devices/disconnect/${deviceId}`, {
      method: "PUT",
    });
  },

  getAll: async () => {
    return apiCall("/devices/all");
  },

  updateBattery: async (deviceId: string, batteryLevel: number) => {
    return apiCall(`/devices/battery/${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({ batteryLevel }),
    });
  },
};

// 🆘 Emergency Contacts API calls
export const emergencyContactsAPI = {
  getAll: async () => {
    return apiCall("/emergency-contacts");
  },

  add: async (contactData: {
    name: string;
    phone: string;
    relation: string;
  }) => {
    return apiCall("/emergency-contacts", {
      method: "POST",
      body: JSON.stringify(contactData),
    });
  },

  delete: async (contactId: string) => {
    return apiCall(`/emergency-contacts/${contactId}`, {
      method: "DELETE",
    });
  },
};
