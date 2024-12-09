const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const itemsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item Name is requied.'],
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is requied.'],
      default: ''
    },
    image: {
      type: String,
      required: [true, 'Image is requied.'],
    },
    price: {
      type: Number,
      required: [true, 'Price is requied.'],
      min: [1, 'Price must be greater than or equal to 1']
    },
    spiceLevel: {
      type: String,
      required: [true, "Spicy field is required."],
      enum: ["NA", "1x", "2x", "3x"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Category is required.']
    },
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Ingredient is required.']
    },
    options: {
      type: Array,
      default: []
    },
    choices: {
      type: Array,
      default: []
    }

  },
  { timestamps: true }
);

itemsSchema.add(commonSchema);

module.exports = mongoose.model("Items", itemsSchema);

