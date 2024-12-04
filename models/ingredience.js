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
      default: ''
    },
    iImage: {
      type: String,
      require: false
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: 'Active'
    },
    isVeg: {
      type: Boolean,
      enum: [true, false],
      default: false
    },
    isVegan: {
      type: Boolean,
      enum: [true, false],
      default: false
    },
    isJain: {
      type: Boolean,
      enum: [true, false],
      default: false
    },
    isSwaminarayan: {
      type: Boolean,
      enum: [true, false],
      default: false
    },
    isNonVeg: {
      type: Boolean,
      enum: [true, false],
      default: false
    },
  },
  { timestamps: true }
);

ingredienceSchema.add(commonSchema);

const IngredienceModel = mongoose.model("Ingredience", ingredienceSchema);

module.exports = IngredienceModel;
