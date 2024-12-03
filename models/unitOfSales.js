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
      default: ''
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: 'Active'
    },
  },
  { timestamps: true }
);

unitOfSalesSchema.add(commonSchema);

const UnitOfSalesModel = mongoose.model("unitOfSales", unitOfSalesSchema);

module.exports = UnitOfSalesModel;
