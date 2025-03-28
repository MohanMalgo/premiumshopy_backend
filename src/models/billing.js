import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    address: [
      {
        flatNo: {
          type: String,
          required: true,
        },
        lane1: {
          type: String,
          required: true,
        },
        lane2: {
          type: String,
          required: true,
        },
      },
    ],
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("billing", billingSchema);