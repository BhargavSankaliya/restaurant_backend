const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const PaymentMethodCtrl = require('../../controllers/RestaurantAdmin/paymentMethodCtrl');
const PaymentMethodModel = require('../../models/paymentMethodModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");


router.post("/", RestaurantAuthCheck, validateSchema(PaymentMethodModel), PaymentMethodCtrl.createUpdate)
router.get("/:id", RestaurantAuthCheck, PaymentMethodCtrl.getItemById)
router.get("/", RestaurantAuthCheck, PaymentMethodCtrl.list)
router.put("/status/:id", RestaurantAuthCheck, PaymentMethodCtrl.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, PaymentMethodCtrl.delete);



module.exports = router