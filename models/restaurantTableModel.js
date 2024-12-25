const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const restaurantTableSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Table name is requied.'],
            default: ''
        },
        tableNumber: {
            type: String,
            required: [true, 'Table Number is requied.'],
            default: ''
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "restaurants",
            default: null
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is requied.'],
            min: [1, 'Capacity must be greater than or equal to 1']
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },
        openTime: {
            type: String,
            required: [false, 'Open time is requied.'],
            default: '',
        },
        qrcode: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

restaurantTableSchema.add(commonSchema);



module.exports = mongoose.model("restaurant_table", restaurantTableSchema);