import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("contactUs", contactUsSchema);
