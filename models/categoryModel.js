const mongoose = require("mongoose");
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
      default: ''
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"restaurants",
      default: null
    },
    image: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: 'Active'
    },
  },
  { timestamps: true }
);

categorySchema.add(commonSchema);

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
