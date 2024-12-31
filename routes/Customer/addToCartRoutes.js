const express = require('express');
const router = express.Router();

const addToCart = require('../../controllers/Customer/addToCartCtrl');

const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");

router.put("/incrementDecrement", CutomerAuthCheck, addToCart.incrementDecrement);

router.post("", CutomerAuthCheck, addToCart.AddToCart);

router.put("/", CutomerAuthCheck, addToCart.UpdateQuantity);

router.delete("/", CutomerAuthCheck, addToCart.RemoveItem);

router.get("/", CutomerAuthCheck, addToCart.GetCartItems);

router.put("/add-coupon", CutomerAuthCheck, addToCart.addCouponinCart);

module.exports = router;
