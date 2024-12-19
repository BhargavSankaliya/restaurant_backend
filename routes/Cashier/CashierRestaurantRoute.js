const express = require('express');
const router = express.Router();
const RestaurantCtrl = require("../../controllers/Cashier/CashierRestaurantCtrl")

router.get("/", RestaurantCtrl.list)

module.exports = router;
