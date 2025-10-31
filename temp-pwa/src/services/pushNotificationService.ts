/**
 * Push Notification Service
 * Uses Web Push API - NO CREDENTIALS NEEDED!
 * Works with existing VAPID keys from .env
 */

// Get VAPID public key from backend
export const getVapidPublicKey = async (): Promise<string> => {
  try {
    const response = await fetch("http://localhost:5000/api/push/vapid-key");
    if (!response.ok) throw new Error("Failed to get VAPID key");
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error("Error getting VAPID key:", error);
    throw error;
  }
};

// Convert base64 URL to Uint8Array (required for push subscriptions)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe to push notifications (NO CREDENTIALS NEEDED!)
export const subscribeToPushNotifications = async (contactId?: string): Promise<boolean> => {
  try {
    // Check if service worker and push manager are available
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    // Register service worker if not already registered
    let registration = await navigator.serviceWorker.ready;
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    }

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not available');
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Send subscription to backend
    const response = await fetch("http://localhost:5000/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contactId,
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!)
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save push subscription');
    }

    console.log('✅ Push notification subscription successful');
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Check if push notifications are supported
export const isPushNotificationSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Check notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

