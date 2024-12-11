const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const permissionSchema = new mongoose.Schema({
  menuId: { type: mongoose.Schema.Types.ObjectId, required: true },
  permission: { type: Boolean, default: false },
});

const restaurantRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, "Role name is required."],
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
    permissions: [permissionSchema],
  },
  { timestamps: true }
);

restaurantRoleSchema.add(commonSchema);

const restaurantRoleModel = mongoose.model("RestaurantRole", restaurantRoleSchema);

module.exports = restaurantRoleModel;
