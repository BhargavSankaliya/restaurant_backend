const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const masterMenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu name is required."],
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
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

masterMenuSchema.add(commonSchema);

const MasterMenu = mongoose.model("MastersMenu", masterMenuSchema);

module.exports = MasterMenu;
