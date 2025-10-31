export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  static async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return;
    }

    // Check if permission is granted
    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      // Try to request permission
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn("Unable to show notification: permission not granted");
        return;
      }
    }

    try {
      // Try to show browser notification first
      new Notification(title, options);
    } catch (error) {
      console.warn("Failed to show browser notification:", error);
      // Fallback to service worker notification if available
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        try {
          await navigator.serviceWorker.ready.then((registration) => {
            return registration.showNotification(title, options || {});
          });
        } catch (swError) {
          console.warn("Failed to show service worker notification:", swError);
        }
      }
    }
  }

  static async showLocalNotification(
    title: string,
    body: string,
    tag?: string
  ): Promise<void> {
    // Create a simple in-app notification as fallback
    const notification = document.createElement("div");
    notification.className = "fixed top-4 right-4 z-50 p-4 bg-primary text-white rounded-lg shadow-lg max-w-sm";
    notification.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm opacity-90">${body}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}