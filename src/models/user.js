import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// import { string } from "joi";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    // unique: true,
    // required: [true, 'Email is required'],
    // match: [
    //     /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    //     'Please fill a valid email address',
    // ],
  },

  phone: {
    type: String,
    // unique: true,
    // required: [true, 'Phone number is required'],
    // match: [/^\d{10}$/, 'Phone number must be 10 digits'],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  about: {
    type: String,
    default: "",
  },
  image: { type: String, default: "" },

  areaOfInterest: {
    type: [String],
    default: [],
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

  Following:[
    {
      name:{type:String},
      email:{type:String},
      profileImage:{type:String},
      status:{type:Boolean}
    },
    {
      timestamps: true,
    }
  ],
  Followers:[
    {
      name:{type:String},
      email:{type:String},
      profileImage:{type:String},
      status:{type:Boolean}
    },
    {
      timestamps: true,
    }
  ],
  
},
{
  timestamps: true,
}
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", userSchema);
