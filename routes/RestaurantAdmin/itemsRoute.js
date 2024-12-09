const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { itemsController } = require('../../controllers/RestaurantAdmin/itemsController');
const ItemsModel = require("../../models/itemsModel");
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(ItemsModel), itemsController.createUpdate );
// router.post('/getItemList', middleware, itemsController.getItemList);
// router.post('/toggleItemStatus', middleware, itemsController.toggleItemStatus);
// router.post('/getItemById', middleware, itemsController.getItemById);
// router.post('/itemDelete', middleware, itemsController.itemDelete);


module.exports = router