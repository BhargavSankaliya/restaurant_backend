const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const restaurantMenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu name is required."],
      default: "",
    },
    parentName: {
      type: String,
      required: false,
      default: "",
    },
    icon: {
      type: String,
      required: [true, "Icon is required."],
      default: "",
    },
    url: {
      type: String,
      required: [true, "URL is required."],
      default: "",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
      default: null
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

restaurantMenuSchema.add(commonSchema);

const RestaurantMenu = mongoose.model("restaurantMenu", restaurantMenuSchema);

module.exports = RestaurantMenu;
