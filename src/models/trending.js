import mongoose from "mongoose";

const TrendingSchema = new mongoose.Schema({
  images: [
    {
      image: String,
      leftviewimage: String,
      rightviewimage: String,
      rotateviewimage: String,
      color: String,
      gender: String,
    },
  ],
  date: Date,
  title: String,
  actualPrice: Number,
  discountPrice: Number,
  offer: String,
  caseMaterial: String,
  thickness: String,
  waterResistant: String,
  brand: String,
  caseDiameter: String,
  dialColor: String,
  movementType: String,
  watchCode: String,
});

const Trending = mongoose.model("Trending", TrendingSchema);
export default Trending;
