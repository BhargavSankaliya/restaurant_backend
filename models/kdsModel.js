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
