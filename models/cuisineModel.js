const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

// Define the Cuisine Schema
const cuisineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure cuisine names are unique
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false, // Optional field for the image URL
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'], // Restrict to specific values
    default: 'Active', // Default to active
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cuisineSchema.add(commonSchema);
// Create the Cuisine Model
const CuisineModel = mongoose.model('Cuisine', cuisineSchema);

// Export the model
module.exports = CuisineModel;
