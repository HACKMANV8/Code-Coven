import { LocationData } from "./locationService";

export interface EmergencyAlert {
  userId?: string;
  location: LocationData;
  timestamp: number;
  alertType: "emergency" | "panic" | "check-in";
  message?: string;
}

export class AlertService {
  private static backendUrl = import.meta.env.VITE_BACKEND_URL || "/api";

  static async sendEmergencyAlert(alert: EmergencyAlert): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/alerts/emergency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send emergency alert");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      
      // Store in IndexedDB for retry if offline
      if (!navigator.onLine) {
        await this.storeOfflineAlert(alert);
      }
      
      throw error;
    }
  }

  static async storeOfflineAlert(alert: EmergencyAlert): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(["offlineAlerts"], "readwrite");
      const store = transaction.objectStore("offlineAlerts");
      
      await store.add(alert);
      
      console.log("Alert stored offline for later sync");
    } catch (error) {
      console.error("Error storing offline alert:", error);
    }
  }

  static async syncOfflineAlerts(): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(["offlineAlerts"], "readonly");
      const store = transaction.objectStore("offlineAlerts");
      const request = store.getAll();
      const alerts = await new Promise<EmergencyAlert[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      for (const alert of alerts) {
        try {
          await this.sendEmergencyAlert(alert);
          
          // Remove from offline storage after successful sync
          const deleteTransaction = db.transaction(["offlineAlerts"], "readwrite");
          const deleteStore = deleteTransaction.objectStore("offlineAlerts");
          await deleteStore.delete(alert.timestamp);
        } catch (error) {
          console.error("Failed to sync alert:", error);
        }
      }
    } catch (error) {
      console.error("Error syncing offline alerts:", error);
    }
  }

  private static openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("SafeLinkDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains("offlineAlerts")) {
          db.createObjectStore("offlineAlerts", { keyPath: "timestamp" });
        }
      };
    });
  }

  static async getAlertHistory(): Promise<EmergencyAlert[]> {
    try {
      const response = await fetch(`${this.backendUrl}/alerts/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alert history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching alert history:", error);
      return [];
    }
  }
}
