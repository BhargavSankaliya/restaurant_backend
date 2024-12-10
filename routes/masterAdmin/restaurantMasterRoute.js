const express = require('express');
const router = express.Router()
const { validateSchema } = require("../../models/baseModel");
const RestaurantMasterCtrl = require('../../controllers/masterAdmin/restaurantMasterCtrl');
const RestaurantMasterModel = require('../../models/restaurantModel');
const middleware = require("../../middlewares/middleware");


router.post("/", middleware, RestaurantMasterCtrl.create);
router.delete("/:restaurantId", middleware, RestaurantMasterCtrl.delete);
router.get("/", middleware, RestaurantMasterCtrl.list);
router.get("/:restaurantId", middleware, RestaurantMasterCtrl.get);
router.put("/status/:restaurantId", middleware, RestaurantMasterCtrl.toggleStatus);


module.exports = router