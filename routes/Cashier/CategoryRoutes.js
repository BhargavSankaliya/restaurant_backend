const express = require('express');
const router = express.Router()
const cashierAuthCheck = require("../../middlewares/cashierAuthCheck");
const CategoryCtrl = require('../../controllers/Cashier/categoryCtrl');


router.get("/", cashierAuthCheck, CategoryCtrl.categoryList);

module.exports = router