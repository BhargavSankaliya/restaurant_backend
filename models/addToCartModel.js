const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const addToCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required."],
      ref: "User",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Restaurant ID is required."],
      ref: "Restaurant",
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Item ID is required."],
          ref: "Items",
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required."],
          min: [1, "Quantity must be at least 1."],
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

addToCartSchema.add(commonSchema);

const addToCartModel = mongoose.model("addToCart", addToCartSchema);

module.exports = addToCartModel;
