const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const StockManagementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: ""
  },
  description: {
    type: String,
    required: true,
    default: ""
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    default: null
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    default: null
  },
  quantity: {
    type: Number,
    required: false,
    default: 0
  },
  unit: {
    type: String,
    required: false,
    default: ""
  },
  minThreshold: {
    type: Number,
    required: false,
    default: 0
  },
  purchasePrice: {
    type: Number,
    required: false,
    default: 0
  },
  sellPrice: {
    type: Number,
    required: false,
    default: 0
  },
  image: {
    type: String,
    required: false,
    default: ""
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  expiryDate: {
    type: Date,
    default: null,
    required: false
  },
});

StockManagementSchema.add(commonSchema);

const stockManagementModel = mongoose.model('RestaurantStockManagement', StockManagementSchema);

module.exports = stockManagementModel;
