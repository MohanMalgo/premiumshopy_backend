import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
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
  category: String,
  timer: Boolean,
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;
