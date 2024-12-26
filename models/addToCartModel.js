const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");

const itemSchema = new mongoose.Schema(
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
    option: {
      name: {
        type: String,
        required: true
      },
      price: {
        type: String,
        required: true
      }
    },
    choices: [
      {
        name: {
          type: String,
          required: false
        },
        itemId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            required: false
          }
        ]
      }
    ],
    modifiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
    ]
  },
  { timestamps: true }
);

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
    items: [itemSchema],
  },
  { timestamps: true }
);

addToCartSchema.add(commonSchema);

const addToCartModel = mongoose.model("addToCart", addToCartSchema);

module.exports = addToCartModel;