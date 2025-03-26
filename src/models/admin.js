
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  otp: {
    type: Number,
  },
  otpExpiresAt: {
    type: Date,
  },
  resetToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
}
);

// Hash password before saving to the database
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Admin", adminSchema);
