const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { itemsController } = require('../../controllers/RestaurantAdmin/itemsController');
const ItemsModel = require("../../models/itemsModel");
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(ItemsModel), itemsController.createUpdate );
router.get('/',RestaurantAuthCheck, itemsController.list);
router.get('/status/:id', RestaurantAuthCheck, itemsController.toggleStatus);
router.get('/:id', RestaurantAuthCheck, itemsController.getItemById);
router.delete('/:id', RestaurantAuthCheck, itemsController.delete);


module.exports = router