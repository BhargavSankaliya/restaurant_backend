const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const unitOfSalesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'unit of sales Name is requied.'],
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: false,
   //   trim: true,
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

unitOfSalesSchema.add(commonSchema);

const UnitOfSalesModel = mongoose.model("unitOfSales", unitOfSalesSchema);

module.exports = UnitOfSalesModel;
