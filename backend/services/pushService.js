import webpush from 'web-push';

// Lazy load VAPID keys (read at runtime, not module load time)
const getVapidKeys = () => {
  return {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  };
};

// Initialize VAPID keys (called lazily)
let vapidInitialized = false;
const initializeVapid = () => {
  if (vapidInitialized) return;
  
  const { publicKey, privateKey } = getVapidKeys();
  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      'mailto:safelink@example.com',
      publicKey,
      privateKey
    );
    vapidInitialized = true;
    console.log('✅ VAPID keys configured for push notifications');
  }
};

/**
 * Send push notification to a subscription
 * @param {Object} subscription - Push subscription object
 * @param {Object} payload - Notification payload
 * @returns {Promise}
 */
export const sendPushNotification = async (subscription, payload) => {
  // Initialize VAPID keys if not already done
  initializeVapid();
  
  const { publicKey, privateKey } = getVapidKeys();
  if (!publicKey || !privateKey) {
    console.warn('⚠️  VAPID keys not configured - push notifications disabled');
    return { 
      success: false, 
      error: 'VAPID keys not configured',
      simulated: true 
    };
  }

  if (!subscription || !subscription.endpoint) {
    return { 
      success: false, 
      error: 'Invalid push subscription' 
    };
  }

  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    
    console.log(`✅ Push notification sent: ${result.statusCode}`);
    return { 
      success: true, 
      statusCode: result.statusCode 
    };
  } catch (error) {
    console.error(`❌ Push notification error:`, error.message);
    
    // Handle specific error codes
    if (error.statusCode === 410) {
      return { 
        success: false, 
        error: 'Subscription expired or invalid',
        code: 410,
        expired: true
      };
    } else if (error.statusCode === 429) {
      return { 
        success: false, 
        error: 'Rate limit exceeded',
        code: 429
      };
    }
    
    return { 
      success: false, 
      error: error.message,
      statusCode: error.statusCode 
    };
  }
};

/**
 * Send emergency alert via push notification
 * @param {Object} subscription - Push subscription
 * @param {string} userName - Name of user in emergency
 * @param {Object} locationData - Location data with landmarks
 * @returns {Promise}
 */
export const sendEmergencyPushAlert = async (subscription, userName, locationData = null) => {
  // Build location information
  let locationInfo = '';
  let mapsLink = '';
  let heartRateInfo = '';
  
  if (locationData) {
    const { latitude, longitude, landmark, heartRate } = locationData;
    
    if (landmark && (landmark.fullAddress || landmark.displayName)) {
      locationInfo = `${landmark.fullAddress || landmark.displayName}`;
      mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    } else if (latitude && longitude) {
      locationInfo = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    // Add heart rate information if available
    if (heartRate && heartRate.bpm) {
      const statusLabels = {
        normal: 'Normal',
        mild_low: 'Mild Low',
        extreme_low: 'Extreme Low ⚠️',
        mild_high: 'Mild High',
        high: 'High ⚠️',
        extreme_high: 'Extreme High 🚨'
      };
      heartRateInfo = `\n💓 Heart Rate: ${heartRate.bpm} bpm (${statusLabels[heartRate.status] || heartRate.status})`;
    }
  }

  const notificationPayload = {
    title: '🚨 EMERGENCY ALERT 🚨',
    body: `${userName || 'A SafeLink user'} needs help immediately!${heartRateInfo}`,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: undefined,
    data: {
      url: mapsLink || 'http://localhost:8081',
      location: locationInfo,
      coordinates: locationData ? {
        lat: locationData.latitude,
        lng: locationData.longitude
      } : null,
      landmark: locationData?.landmark || null,
      heartRate: locationData?.heartRate || null,
      timestamp: new Date().toISOString(),
      type: 'emergency'
    },
    requireInteraction: true,
    priority: 'high',
    vibrate: [200, 100, 200],
    tag: 'emergency-alert',
    actions: locationData && mapsLink ? [
      {
        action: 'open-maps',
        title: 'Open Maps',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ] : []
  };

  return await sendPushNotification(subscription, notificationPayload);
};

/**
 * Get VAPID public key (needed for frontend subscription)
 */
export const getVapidPublicKey = () => {
  const { publicKey } = getVapidKeys();
  return publicKey;
};

