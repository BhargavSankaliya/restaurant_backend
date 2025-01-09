const express = require('express');
const router = express.Router()
const cashierAuthCheck = require("../../middlewares/cashierAuthCheck");
const CashierAuthCtrl = require('../../controllers/Cashier/CashierAuthCtrl');


router.post("/login", CashierAuthCtrl.login);

router.post("/forgot-password", CashierAuthCtrl.forgotPassword);

router.post("/verify-otp", CashierAuthCtrl.verifyOTP);

router.post("/reset-password", CashierAuthCtrl.resetPassword);

router.post("/change-password", cashierAuthCheck, CashierAuthCtrl.changePassword);

router.get("/restaurants", CashierAuthCtrl.list)

router.get("/restaurants/:restaurantId/users", CashierAuthCtrl.userListByRestaurantId)

module.exports = router