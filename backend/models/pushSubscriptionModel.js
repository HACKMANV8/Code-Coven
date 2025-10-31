import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
  contactId: {
    type: String,
    required: false, // Optional - can subscribe without being a contact
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PushSubscription", pushSubscriptionSchema);

