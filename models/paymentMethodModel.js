const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const paymentMethodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Payment Name is requied.'],
        },
        methodType: {
            type: String,
            required: [true, 'Method type is requied'],
            enum: ["Card", "Wallet", "UPI"],
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "restaurants",
            default: null
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: 'Active'
        },
    },
    { timestamps: true }
);

paymentMethodSchema.add(commonSchema);



module.exports = mongoose.model("Payment_Method", paymentMethodSchema);
