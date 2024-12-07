const express = require('express');
const router = express.Router()
const { validateSchema } = require("../../models/baseModel");
const RestaurantMasterCtrl = require('../../controllers/masterAdmin/restaurantMasterCtrl');
const RestaurantMasterModel = require('../../models/restaurantModel');
const middleware = require("../../middlewares/middleware");


router.post("/restaurant", middleware, validateSchema(RestaurantMasterModel), RestaurantMasterCtrl.create);


module.exports = router