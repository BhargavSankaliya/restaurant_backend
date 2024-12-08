const express = require('express');
const router = express.Router()
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const RestaurantAuthCtrl = require('../../controllers/RestaurantAdmin/restaurantAuthCtrl');


router.post("/login",  RestaurantAuthCtrl.login);
router.post("/forgot-password",  RestaurantAuthCtrl.forgotPassword);
router.post("/verify-otp",  RestaurantAuthCtrl.verifyOTP);
router.post("/reset-password",  RestaurantAuthCtrl.resetPassword);
router.post("/change-password", restaurantAuthCheck ,RestaurantAuthCtrl.changePassword);


module.exports = router