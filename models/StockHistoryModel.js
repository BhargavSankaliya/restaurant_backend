const mongoose = require('mongoose');
const commonSchema = require("./CommonModel");

const StockHistorySchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null
  },
  quantityConsumed: {
    type: Number,
    required: false,
    default: 0
  },
  remarks: {
    type: String,
    required: false,
    default: null,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
});

StockHistorySchema.add(commonSchema);

const StockHistoryModel = mongoose.model('RestaurantStockHistory', StockHistorySchema);

module.exports = StockHistoryModel;
