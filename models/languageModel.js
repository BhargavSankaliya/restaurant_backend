const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  direction: {
    type: String,
    required: false,
    default: null
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
});

languageSchema.add(commonSchema);

const LanguageModel = mongoose.model('restaurantLanguage', languageSchema);

module.exports = LanguageModel;
