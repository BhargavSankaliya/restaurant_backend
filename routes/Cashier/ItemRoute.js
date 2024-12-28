const express = require('express');
const router = express.Router()
const cashierAuthCheck = require("../../middlewares/cashierAuthCheck");
const ItemCtrl = require('../../controllers/Cashier/ItemCtrl');


router.get("/:categoryId", cashierAuthCheck, ItemCtrl.list);

module.exports = router