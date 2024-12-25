const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const restaurantStaffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
    default: ""
  },
  lastName: {
    type: String,
    required: false,
    default: ""
  },
  email: {
    type: String,
    required: [true, 'Email is requied.'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    },
    default: ''
  },
  mobile: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        const isValid = validator.isMobilePhone(value);
        return isValid
      },
      message: 'Please provide a valid  mobile number',
    },
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  image: {
    type: String,
    required: false,
    default: ""
  },
  documents: {
    type: Array,
    required: false,
    default: []
  },
  address: {
    type: String,
    required: false,
    default: ""
  },
  country: {
    type: String,
    required: false,
    default: ""
  },
  state: {
    type: String,
    required: false,
    default: ""
  },
  city: {
    type: String,
    required: false,
    default: ""
  },
  postCode: {
    type: Number,
    required: false,
    default: ""
  },
  userId: {
    type: Number,
    required: false,
    default: ""
  },
  pin: {
    type: Number,
    required: false,
    default: null
  },
  salary: {
    type: Number,
    required: false,
    default: null
  },
  salaryType: {
    type: String,
    required: false,
    default: ""
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
});

restaurantStaffSchema.add(commonSchema);

restaurantStaffSchema.pre('save', async function (next) {
  if (!this.userId) {
    let isUnique = false;
    while (!isUnique) {
      const newUserId = generate6DigitNumber();
      const existingUser = await this.constructor.findOne({ userId: newUserId });
      if (!existingUser) {
        this.userId = newUserId;
        isUnique = true;
      }
    }
  }
  next();
});

function generate6DigitNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const restaurantStaffModel = mongoose.model('restaurantStaff', restaurantStaffSchema);

module.exports = restaurantStaffModel;
