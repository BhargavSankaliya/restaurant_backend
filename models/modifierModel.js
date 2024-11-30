const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const modifierSchema = new mongoose.Schema(
  {
    additionalItemName: {
      type: String,
      required: [true, 'Additional Item Name is requied.'],
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is requied.'],
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is requied.'],
      default: 0
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      // required: [true, 'Status is required.'],
      default: "Active"
    },
    modifierImage: {
      type: String,
      default: '',
      //required: true
    },
  },
  { timestamps: true }
);

modifierSchema.add(commonSchema);

const modifierModel = mongoose.model("Modifiers", modifierSchema);

module.exports = modifierModel;
