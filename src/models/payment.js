import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  
    "amount": { type: Number },
    "accountNumber": { type: String },
    "confirmAccountNumber": { type: String, default: "" },
    "ifsc": { type: String, default: "" },
    "paypalId": { type: String, default: '' },
    "email": { type: String, default: '' },
    "memberID": { type: String, default: "" },
    "orderId": { type: String, default: "" },
    "currency": { type: String, default: "" },
    
    "status": { type: Boolean, default: false },
    "type": { type: String, default: '' },
    "signature": { type: String, default: "" },
    "paymentId": { type: String, default: "" },
    "name": { type: String, default: "" },

    


},
{
    timestamps: true,
  });

export default mongoose.model("Payment", paymentSchema);
