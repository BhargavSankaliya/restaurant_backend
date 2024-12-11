const express = require('express');
const router = express.Router()
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const RestaurantTableCtrl = require('../../controllers/RestaurantAdmin/restaurantTableCtrl');
const RestaurantTableModel=require("../../models/restaurantTableModel")
const { validateSchema } = require('../../models/baseModel');


router.post("/",restaurantAuthCheck,validateSchema(RestaurantTableModel),RestaurantTableCtrl.createUpdate)
router.get("/",restaurantAuthCheck,RestaurantTableCtrl.list)
router.put("/status/:id",restaurantAuthCheck,RestaurantTableCtrl.toggleStatus)
router.get("/:id",restaurantAuthCheck,RestaurantTableCtrl.getItemById)
router.delete("/:id",restaurantAuthCheck,RestaurantTableCtrl.delete)

module.exports = router