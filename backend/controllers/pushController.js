import { sendEmergencyPushAlert, getVapidPublicKey } from '../services/pushService.js';
import Location from '../models/locationModel.js';
import PushSubscription from '../models/pushSubscriptionModel.js';

// GET VAPID public key (for frontend subscription)
export const getVapidKey = async (req, res) => {
  try {
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return res.status(500).json({
        success: false,
        error: 'VAPID keys not configured'
      });
    }
    res.status(200).json({ publicKey });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST subscribe device for push notifications (NO CREDENTIALS NEEDED!)
export const subscribeContact = async (req, res) => {
  try {
    const { contactId, subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Push subscription required'
      });
    }

    // Save or update push subscription
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });
    
    if (existing) {
      // Update existing subscription
      existing.keys = subscription.keys;
      if (contactId) existing.contactId = contactId;
      await existing.save();
    } else {
      // Create new subscription
      await PushSubscription.create({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        contactId: contactId || null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Push subscription saved successfully'
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST send emergency push alert to all subscribed contacts
export const sendEmergencyPush = async (req, res) => {
  try {
    const { location } = req.body;
    const userName = req.user?.name || 'Unknown User';

    // Save location to database if provided
    let locationId = null;
    if (location && location.latitude && location.longitude) {
      const locationDoc = new Location({
        latitude: location.latitude,
        longitude: location.longitude,
        landmark: location.landmark || undefined
      });
      await locationDoc.save();
      locationId = locationDoc._id;
    }

    // Get all push subscriptions (device-based, NO CREDENTIALS NEEDED!)
    const subscriptions = await PushSubscription.find({});

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No devices subscribed for push notifications',
        locationId,
        hint: 'Ask emergency contacts to visit the PWA and enable push notifications'
      });
    }

    // Send push notifications to all subscribed devices
    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        sendEmergencyPushAlert(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          userName,
          location
        )
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Remove expired subscriptions
    const expiredSubs = results
      .map((r, i) => ({ index: i, result: r }))
      .filter(({ result }) => 
        result.status === 'fulfilled' && 
        result.value.expired
      );

    if (expiredSubs.length > 0) {
      const expiredEndpoints = expiredSubs.map(({ index }) => subscriptions[index].endpoint);
      await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } });
      console.log(`🗑️  Removed ${expiredSubs.length} expired push subscriptions`);
    }

    res.status(200).json({
      success: true,
      message: `Push notifications sent to ${successful} device(s)`,
      sent: successful,
      failed: failed,
      totalDevices: subscriptions.length,
      locationId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

