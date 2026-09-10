const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: ["Starter", "Main Course", "Dessert", "Beverage"],
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    availability: {
      type: Boolean,
      default: true, // true = In Stock, false = Out of Stock
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    imagePublicId: {
      type: String, // used to delete/replace the old Cloudinary image
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
