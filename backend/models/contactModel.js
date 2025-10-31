import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  // Push notification subscription for emergency alerts
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
});

export default mongoose.model("Contact", contactSchema);
