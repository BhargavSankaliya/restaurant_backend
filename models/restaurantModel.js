const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");

const openingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      default: ""
    },
    startTime: {
      type: String,
      default: ""
    },
    endTime: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const RestaurantAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant Name is required.'],
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Role is required.']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required.'],
      min: [1, 'Capacity must be greater than or equal to 1'],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    address: {
      type: String,
      default: '',
    },
    gstNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[A-Z0-9]{1}$/, "Invalid GST Number format"],
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          const isValid = validator.isMobilePhone(value);
          return isValid
        },
        message: 'Please provide a valid  phone number',
      },
      unique: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: 'Please provide a valid email address',
      },
      unique: true,
    },
    password: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          return value.length >= 6;
        },
        message: 'Password must be at least 6 characters long',
      },
    },
    website: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          return value ? validator.isURL(value) : true;
        },
        message: 'Please provide a valid URL for the website',
      },
    },
    logo: {
      type: String,
      required: [true, 'Logo is required.'],
      default: ""
    },
    media: {
      type: String,
      required: [true, 'media is required.'],
      default: ""
    },
    legalDoc: {
      type: String,
      default: ""
    },
    openingHour: {
      type: [openingHourSchema],
      default: []
    },
    token: {
      type: String,
      default: '',
    },

  },
);

RestaurantAdminSchema.add(commonSchema);
module.exports = mongoose.model("Restaurant", RestaurantAdminSchema);
