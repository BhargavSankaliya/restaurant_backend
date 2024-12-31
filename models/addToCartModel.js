const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const optionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Default",
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  isDefault: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const itemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Items",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    notes: {
      type: String,
      required: false,
      default: "",
    },
    option: {
      type: [optionSchema],
      default: [],
    },
    choices: {
      type: [String],
      default: [],
    },
    modifiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null,
      },
    ],
  },
  { timestamps: true }
);

const addToCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Restaurant",
    },
    items: {
      type: [itemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

addToCartSchema.add(commonSchema);

const addToCartModel = mongoose.model("addToCart", addToCartSchema);

module.exports = addToCartModel;
