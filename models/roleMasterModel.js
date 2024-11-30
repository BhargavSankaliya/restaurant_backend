const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const roleMasterSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, 'Role name is requied.'],
      default: ''
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      // required: [true, 'Status is required.'],
      default: "Active"
    },
  },
  { timestamps: true }
);

roleMasterSchema.add(commonSchema);

const roleMasterModel = mongoose.model("Roles", roleMasterSchema);

module.exports = roleMasterModel;
