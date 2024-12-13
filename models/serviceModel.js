const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    default: null
  },
  image: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
});

serviceSchema.add(commonSchema);

const ServiceModel = mongoose.model('Service', serviceSchema);

module.exports = ServiceModel;
