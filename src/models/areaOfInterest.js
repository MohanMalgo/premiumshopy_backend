import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  image: { type: String, default: "" },
},
{
  timestamps: true,
}
);

export default mongoose.model("Interest", interestSchema);
