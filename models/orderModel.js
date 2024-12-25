const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");


const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true },
      status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Picked', 'On the Way', 'Delivered', 'Cancelled'], default: 'Pending' },
    },
  ],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
  couponCode: { type: String, default: null },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Picked', 'On the Way', 'Delivered', 'Cancelled'], default: 'Pending' },

  tableId: { type: mongoose.Schema.Types.ObjectId, default: null },
  tableNumber: { type: String, default: null },
  pickupAddress: { type: String, default: null },
  deliveryAddress: { type: String, default: null },
  dining: { type: Boolean, default: false },
  takeaway: { type: Boolean, default: false },
  altogether: { type: Boolean, default: false },
});

orderSchema.add(commonSchema);

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
