const mongoose = require("mongoose");
const { CountryCodes } = require("validator/lib/isISO31661Alpha2");

const LoginVerificationSchema = mongoose.Schema(
  {
    email: {
      type: String,
      default: ""
    },
    otp: {
      type: String,
      require: true
    },
    dialCode: {
      type: String,
      default: ""
    },
    phoneNumber: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginVerification", LoginVerificationSchema);
