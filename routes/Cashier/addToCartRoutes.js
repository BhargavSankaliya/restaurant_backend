const express = require('express');
const router = express.Router();

const addToCart = require('../../controllers/Cashier/addToCartCtrl');

const CashierAuthCheck = require("../../middlewares/cashierAuthCheck");

router.put("/incrementDecrement", CashierAuthCheck, addToCart.incrementDecrement);
router.post("/", CashierAuthCheck, addToCart.AddToCart);
router.put("/", CashierAuthCheck, addToCart.UpdateQuantity);
router.delete("/", CashierAuthCheck, addToCart.RemoveItem);
router.get("/:restaurantId", CashierAuthCheck, addToCart.GetCartItems);

module.exports = router;
