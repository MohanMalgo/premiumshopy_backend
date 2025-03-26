import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema({
  type: { type: String, required: true },
  temp: { type: String, required: true },
},{
  timestamps: true,
});

export default mongoose.model("emailTemplate", emailTemplateSchema);
