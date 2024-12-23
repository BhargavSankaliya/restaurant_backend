const express = require('express');
const router = express.Router();

const orderCtrl = require('../../controllers/Cashier/orderCtrl');

const CashierAuthCheck = require("../../middlewares/cashierAuthCheck");

router.post("/", CashierAuthCheck, orderCtrl.cashierPlaceOrder);
router.get("/", CashierAuthCheck, orderCtrl.getCashierOrderHistory);


module.exports = router;
