import mongoose from "mongoose";

// Define the category schema
const categorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // Category name
    categoryurl: { type: String, required: true }, // Image URL
    status: { type: Boolean, default: true }, // Active status
  },
  { timestamps: true }
);

// Create and export the model
const Category = mongoose.model("Category", categorySchema);
export default Category;
