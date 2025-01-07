const express = require('express');

const router = express.Router()
const RestaurantCtrl = require('../../controllers/Customer/restaurantCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/:restaurantId",  RestaurantCtrl.restaurantDetails)



module.exports = router