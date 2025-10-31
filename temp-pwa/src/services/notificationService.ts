export class NotificationService {
  private static vapidPublicKey: string = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

  static async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  static async subscribeToPush(
    registration: ServiceWorkerRegistration
  ): Promise<PushSubscription | null> {
    try {
      const applicationServerKey = this.vapidPublicKey 
        ? this.urlBase64ToUint8Array(this.vapidPublicKey)
        : undefined;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to your backend
      await this.sendSubscriptionToBackend(subscription);

      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  static async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    // Replace with your actual backend endpoint
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "/api/push/subscribe";

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error("Failed to send subscription to backend");
      }
    } catch (error) {
      console.error("Error sending subscription to backend:", error);
      throw error;
    }
  }

  static async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      ...options,
    });
  }

  private static urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  static isSupported(): boolean {
    return "Notification" in window && "serviceWorker" in navigator;
  }

  static getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}
