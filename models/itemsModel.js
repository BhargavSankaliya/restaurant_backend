const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");

const openingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      default: ""
    },
    startTime: {
      type: String,
      default: ""
    },
    endTime: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);
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
    choices: [{
      name: {
        type: String,
      },
      minChoice: {
        type: Number,
      },
      maxChoice: {
        type: Number,
      },
      items: {
        type: Array,
      }
    }],
    options: [{
      name: {
        type: String,
        default: ""
      },
      price: {
        type: Number,
        default: 0
      }
    }],
  }, { timestamps: true }
);

itemsSchema.add(commonSchema);

module.exports = mongoose.model("Items", itemsSchema);

