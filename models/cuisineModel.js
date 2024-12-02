const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const cuisineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
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

cuisineSchema.add(commonSchema);

const CuisineModel = mongoose.model('Cuisine', cuisineSchema);

module.exports = CuisineModel;
