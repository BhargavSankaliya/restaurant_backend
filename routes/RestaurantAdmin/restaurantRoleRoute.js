const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const restaurantRoleModel = require('../../models/restaurantRoleModel');
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const { restaurantRoleController } = require('../../controllers/RestaurantAdmin/restaurantRoleController');


router.post("", restaurantAuthCheck, validateSchema(restaurantRoleModel), restaurantRoleController.roleCreateUpdate);
router.get("", restaurantAuthCheck, restaurantRoleController.roleList);
router.put('/status', restaurantAuthCheck, restaurantRoleController.toggleRoleStatus);
router.get('/:id', restaurantAuthCheck, restaurantRoleController.getRoleById);


module.exports = router