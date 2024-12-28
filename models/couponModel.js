const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const couponSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    default: null
  },
  name: { type: String, required: false, default: "" },
  file: { type: String, required: false, default: "" },
  code: { type: String, required: false, unique: false, default: "" },
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
couponSchema.add(commonSchema);

couponSchema.pre('save', async function (next) {
  if (!this.code) {
    let isUnique = false;
    let generatedCode;

    while (!isUnique) {
      generatedCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      const existingCoupon = await mongoose.model('Coupon').findOne({
        code: generatedCode,
        restaurantId: this.restaurantId
      });
      if (!existingCoupon) {
        isUnique = true;
      }
    }
    this.code = generatedCode;
  }
  next();
});

const CouponModel = mongoose.model('Coupon', couponSchema);

module.exports = CouponModel;