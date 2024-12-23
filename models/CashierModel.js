const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const CashierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required."],
        },
        email: {
            type: String,
            required: [true, "Email is required."],
            unique: true
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: 'Active'
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",

        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        token: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            required: [true, "Image is required"],
            default: '',
        },
    },
    { timestamps: true }
);

CashierSchema.add(commonSchema);


module.exports = mongoose.model("Cashier", CashierSchema);

