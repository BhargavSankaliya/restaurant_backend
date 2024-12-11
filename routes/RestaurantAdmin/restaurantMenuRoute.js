const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const { restaurantMenuController } = require('../../controllers/RestaurantAdmin/restaurantMenuController');
const RestaurantMenuModel = require('../../models/restaurantMenuModel');


router.post("", restaurantAuthCheck, validateSchema(RestaurantMenuModel), restaurantMenuController.menuCreateUpdate);
router.get("", restaurantAuthCheck, restaurantMenuController.menuList);
router.put('/status', restaurantAuthCheck, restaurantMenuController.updateMenuStatus);
router.get('/:id', restaurantAuthCheck, restaurantMenuController.getMenuById);


module.exports = router