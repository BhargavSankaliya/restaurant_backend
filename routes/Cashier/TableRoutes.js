const express = require('express');
const router = express.Router()
const cashierAuthCheck = require("../../middlewares/cashierAuthCheck");
const TableCtrl = require('../../controllers/Cashier/tableCtrl');


router.get("/", cashierAuthCheck, TableCtrl.list);

module.exports = router