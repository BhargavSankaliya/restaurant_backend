const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");

const optionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Default",
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  isDefault: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const itemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Items",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    option: {
      type: [optionSchema],
      default: [],
    },
    choices: {
      type: [String],
      default: [],
    },
    modifiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null,
      },
    ],
    status: { type: String, enum: ["Pending", "Confirmed", "Preparing", "Ready", "Picked", "On the Way", "Delivered", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: {
    type: [itemSchema],
    default: [],
  },
  coupons: [
    {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
      couponCode: { type: String, default: null },
    },
  ],
  status: { type: String, enum: ["Pending", "Confirmed", "Preparing", "Ready", "Picked", "On the Way", "Delivered", "Cancelled"], default: "Pending" },
  tableId: { type: mongoose.Schema.Types.ObjectId, default: null },
  tableNumber: { type: String, default: null },
  pickupAddress: { type: String, default: null },
  deliveryAddress: { type: String, default: null },
  dining: { type: Boolean, default: false },
  takeaway: { type: Boolean, default: false },
  altogether: { type: Boolean, default: false },
  payment: {
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    tipAmount: { type: Number, required: true, default: 0 },
    gst: { type: Number, required: true, default: 0 },
  },
  orderBy: {
    type: String, enum: ["qrApp", "Cashier", "customer"],
  },
});

orderSchema.add(commonSchema);

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
