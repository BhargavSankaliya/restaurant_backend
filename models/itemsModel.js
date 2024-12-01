const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const itemsSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item Name is requied.'],
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
      default: "Active"
    },
    itemImage: {
      type: String,
      default: '',
    },
    cuisine: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Cuisine is required.']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Category is required.']
    },
    unitOfSale: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'UnitOfSale is required.']
    },
    additionalItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'AdditionalItem is required.']
    },
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Ingredient is required.']
    },
    spicy: {
      type: String,
      required: [true, "Spicy field is required."],
      enum: ["NA", "1x", "2x", "3x"],
    },

  },
  { timestamps: true }
);

itemsSchema.add(commonSchema);

const modifierModel = mongoose.model("Items", itemsSchema);

module.exports = modifierModel;
