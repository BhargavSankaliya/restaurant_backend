const express = require('express');
const router = express.Router();

const orderCtrl = require('../../controllers/Customer/orderCtrl');

const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");

router.post("/", CutomerAuthCheck, orderCtrl.placeOrder);
router.get("/", CutomerAuthCheck, orderCtrl.getCustomerOrderHistory);


module.exports = router;
