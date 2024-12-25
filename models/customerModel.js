const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");

const CustomerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First Name is required.'],
        },
        lastName: {
            type: String,
            required: [true, 'Last Name is required.'],
        },
        conutryCode: {
            type: String,
            required: [true, 'Last Name is required.'],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Last Name is required.'],
            unique: true
        },
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Role is required.']
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },
    },
);

CustomerSchema.add(commonSchema);
module.exports = mongoose.model("Customer", CustomerSchema);
