
import mongoose from "mongoose";
const ratingsSchema = new mongoose.Schema({
  eventId: { type: String, default: "" },
  venueId: { type: String, default: "" },
  status: { type: Boolean, default: true },
  name: { type: String },
  image: {type: String},
  userID: { type: String },
  email: { type: String },
  ratings: { type: Number },
  comment: { type: String },
},
{
  timestamps: true,
}
);
export default mongoose.model("ratings", ratingsSchema);
