import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  
    accountHolderName: { type: String, default: "" },
    bankName: { type: String, default: "" },
    branchName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    shiftCode: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    userID: { type: String, default: "" },
},
{
    timestamps: true,
  });

export default mongoose.model("bankDetails", bankSchema);
