const API_BASE = "http://localhost:5000/api"; // ✅ change to your backend URL

export const alertAPI = {
  sendAlert: async (data: {
    latitude: number;
    longitude: number;
    timestamp: string;
    trigger: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send alert");
      return await res.json();
    } catch (err) {
      console.error("Error sending alert:", err);
      throw err;
    }
  },
};
