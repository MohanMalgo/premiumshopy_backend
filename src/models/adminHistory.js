
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const adminHistorySchema = new mongoose.Schema({
  email: {
    type: String,
  },

  browser_name: { type: String, default: "" },
  ip_address: { type: String, default: "" },
  os: { type: String, default: "" },
  country: { type: String, default: "" },
  region: { type: String, default: "" },
  city: { type: String, default: "" },
  regionName: { type: String, default: "" },
  device:{ type: String, default: "" },




  status: {
    type: Boolean,
    default: true,
  },


},
{
  timestamps: true,
}
);

// Hash password before saving to the database
adminHistorySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("adminHistory", adminHistorySchema);
