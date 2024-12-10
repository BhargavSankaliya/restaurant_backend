const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const kdsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is requied.'],
      default: ''
    },
    location: {
      type: String,
      required: [true, 'Location is requied.'],
      default: ''
    },
    isDefault: {
      type: Boolean,
      required: [true, 'IsDefault is requied.'],
      default: true
    },
    foodCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'FoodCategory is requied.'],
        default: null
      }
    ],
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
      default: null
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

kdsSchema.add(commonSchema);

const kdsModel = mongoose.model("kds", kdsSchema);

module.exports = kdsModel;
