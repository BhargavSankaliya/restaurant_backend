const express = require('express');
const router = express.Router();

const orderCtrl = require('../../controllers/Cashier/orderCtrl');

const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");

router.post("/", CutomerAuthCheck, orderCtrl.cashierPlaceOrder);
router.get("/", CutomerAuthCheck, orderCtrl.getCashierOrderHistory);


module.exports = router;
