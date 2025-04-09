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
    productId: { type: String, default: "" },
    TotalItems: { type: String, default: "" },
    Delivery: { type: String, default: "" },
    SubTotal: { type: String, default: "" },
    amount: { type: String, default: "" },
    paymentStatus: { type: Boolean, default: false },
    orderId: { type: String, default: "" },
    Dispatched:{ type: String, default: ""},
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
    type: {
      type: String,
      default: ""
    },
    state: {
      type: String,
      
    },
    status:{
      type: Boolean,
      default:false
    },
    signature: {
      type: String,
      default: ""
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