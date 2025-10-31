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
});

export default mongoose.model("Contact", contactSchema);
