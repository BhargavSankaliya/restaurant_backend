const express = require('express');
const router = express.Router()
const cashierAuthCheck = require("../../middlewares/cashierAuthCheck");
const CashierAuthCtrl = require('../../controllers/Cashier/categoryCtrl');


router.get("/",  CashierAuthCtrl.login);

module.exports = router