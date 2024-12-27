const express = require('express');

const router = express.Router()
const CouponsCtrl = require('../../controllers/Customer/couponsCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/list/:restaurantId", CutomerAuthCheck, CouponsCtrl.List)



module.exports = router