const express = require('express');
const router = express.Router();
const { couponController } = require('../../controllers/RestaurantAdmin/couponController');
const { validateSchema } = require('../../models/baseModel');
const CouponModel = require('../../models/couponModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(CouponModel), couponController.createCoupon);
router.get("/dropdown", RestaurantAuthCheck, couponController.dropDown);
router.get("/:id", RestaurantAuthCheck, couponController.couponGetById);
router.get("/", RestaurantAuthCheck, couponController.couponList);
router.put("/status/:id", RestaurantAuthCheck, couponController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, couponController.delete);

module.exports = router;
