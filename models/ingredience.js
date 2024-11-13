const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const ingredienceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'category Name is requied.'],
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: false,
      //   trim: true,
      default: ''
    },
    iImage: {
      type: String,
      required: [true, 'image is required.'],
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      required: [true, 'Status is required.'],
      default: ''
    },
    isVeg: {
      type: Boolean,
      enum: [true, false],
      //required: [true, 'Status is required.'],
      default: ''
    },
    isVegan: {
      type: Boolean,
      enum: [true, false],
      //required: [true, 'Status is required.'],
      default: ''
    },
    isJain: {
      type: Boolean,
      enum: [true, false],
      //required: [true, 'Status is required.'],
      default: ''
    },
    isSwaminarayan: {
      type: Boolean,
      enum: [true, false],
      //required: [true, 'Status is required.'],
      default: ''
    },
    isNonVeg: {
      type: Boolean,
      enum: [true, false],
      //required: [true, 'Status is required.'],
      default: ''
    },
  },
  { timestamps: true }
);

ingredienceSchema.add(commonSchema);

const IngredienceModel = mongoose.model("Ingredience", ingredienceSchema);

module.exports = IngredienceModel;
