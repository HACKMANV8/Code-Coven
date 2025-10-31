// frontend/src/lib/api.ts
// Central API service for all backend communication

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call handler with error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Emergency Contacts API
export const emergencyContactsAPI = {
  // Get all contacts
  getAll: async () => {
    return apiCall('/emergency-contacts');
  },

  // Get single contact by ID
  getById: async (id: string) => {
    return apiCall(`/emergency-contacts/${id}`);
  },

  // Create new contact
  create: async (contactData: { name: string; phone: string; relation: string }) => {
    return apiCall('/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  // Update contact
  update: async (id: string, contactData: { name: string; phone: string; relation: string }) => {
    return apiCall(`/emergency-contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  },

  // Delete contact
  delete: async (id: string) => {
    return apiCall(`/emergency-contacts/${id}`, {
      method: 'DELETE',
    });
  },
};

// SMS/Alert API (add this when we integrate SMS functionality)
export const alertAPI = {
  sendAlert: async (alertData: { location: string; message: string }) => {
    return apiCall('/alerts/send', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },
};

// History API (for tracking past alerts)
export const historyAPI = {
  getHistory: async () => {
    return apiCall('/history');
  },
};