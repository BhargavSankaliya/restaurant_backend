const mongoose = require("mongoose");
const validator = require("validator");
const commonSchema = require("./CommonModel");

// const locationSchema = new mongoose.Schema({
//   address: {
//     type: String,
//     required: [true, 'Location address is required.'],
//     trim: true
//   },
//   city: {
//     type: String,
//     required: [true, 'City is required.'],
//     trim: true
//   },
//   state: {
//     type: String,
//     required: [true, 'State is required.'],
//     trim: true
//   },
//   country: {
//     type: String,
//     required: [true, 'Country is required.'],
//     trim: true
//   },
//   pinCode: {
//     type: String,
//     required: [true, 'Pincode is required.'],
//     trim: true
//   }
// });

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'first Name is requied.'],
      //  trim: true,
      default: ''
    },
    lastName: {
      type: String,
      required: [true, 'last Name is requied.'],
      //  trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email is requied.'],
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
    phone: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      enum: [true, false],
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, 'gender is required.'],
      trim: true,
      default: ''
    },
    address: {
      type: String,
      required: false,
      default: ''
    },

    locations: {
      type: Object,
      require: false,
      //default: []
    },

    coverPicture: {
      type: String,
      //   required: true,
      default: ''
    },
    profilePicture: {
      type: String,
      default: '',
      //required: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // By Meet
    role: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Role is required.']
    }

  },
  { timestamps: true }
);

userSchema.add(commonSchema);

const UserModel = mongoose.model("Users", userSchema);

module.exports = UserModel;
