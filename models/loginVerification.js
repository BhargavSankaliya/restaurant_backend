const mongoose = require("mongoose");

const LoginVerificationSchema = mongoose.Schema(
  {
    email: {
      type: String,
      require: true
    },
    otp: {
      type: Number,
      default: ""
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginVerification", LoginVerificationSchema);
