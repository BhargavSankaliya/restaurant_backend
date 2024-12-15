const express = require('express');
const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const CustomerAuthCtrl = require('../../controllers/Customer/customerAuthCtrl');
const CustomerModel = require('../../models/customerModel');


router.post("/send-otp", validateSchema(CustomerModel), CustomerAuthCtrl.SendOtp)
router.post("/verify-otp", CustomerAuthCtrl.verifyOTP)
router.post("/resend-otp", CustomerAuthCtrl.resendOTP)



module.exports = router