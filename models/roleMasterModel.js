const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const permissionSchema = new mongoose.Schema({
  menuId: { type: mongoose.Schema.Types.ObjectId, required: true },
  permission: { type: Boolean, default: false },
});

const roleMasterSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, "Role name is required."],
      default: "",
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

roleMasterSchema.add(commonSchema);

const roleMasterModel = mongoose.model("MastersRole", roleMasterSchema);

module.exports = roleMasterModel;
