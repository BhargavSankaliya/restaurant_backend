const express = require('express');
const router = express.Router();

const addToCart = require('../../controllers/Cashier/addToCartCtrl');

const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");

router.put("/incrementDecrement", CutomerAuthCheck, addToCart.incrementDecrement);
router.post("/", CutomerAuthCheck, addToCart.AddToCart);
router.put("/", CutomerAuthCheck, addToCart.UpdateQuantity);
router.delete("/", CutomerAuthCheck, addToCart.RemoveItem);
router.get("/:restaurantId", CutomerAuthCheck, addToCart.GetCartItems);

module.exports = router;
