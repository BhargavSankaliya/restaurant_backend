const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const offerSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    default: null
  },
  name: { type: String, required: false, default: "" },
  description: { type: String, required: false, default: "" },
  type: { type: String, enum: ["datewise", "limit", "both"], required: false },
  limit: { type: Number, default: null },
  start_date: { type: Date, required: false, default: null },
  end_date: { type: Date, required: false, default: null },
  min_order_value: { type: Number, default: 0 },
  discount_percentage: { type: Number, required: false },
  max_discounted_amount: { type: Number, required: false },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
});

offerSchema.add(commonSchema);

const OfferModel = mongoose.model('Offer', offerSchema);

module.exports = OfferModel;