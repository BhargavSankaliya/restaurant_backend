const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const masterAdminModuleMastersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required."],
      default: "",
    },
    value: {
      type: String,
      required: [true, "value is required."],
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    }
  },
  { timestamps: true }
);

masterAdminModuleMastersSchema.add(commonSchema);

const roleMasterModel = mongoose.model("masterAdminModuleMasters", masterAdminModuleMastersSchema);

module.exports = roleMasterModel;
