const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const categorySchema = new mongoose.Schema(
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
    cImage: {
      type: String,
      required: [true, 'categoryImage is required.'],
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      required: [true, 'Status is required.'],
      default: ''
    },
  },
  { timestamps: true }
);

categorySchema.add(commonSchema);

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
