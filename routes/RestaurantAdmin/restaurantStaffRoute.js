const express = require('express');
const router = express.Router();
const { restaurantStaffController } = require('../../controllers/RestaurantAdmin/restaurantStaffController');
const { validateSchema } = require('../../models/baseModel');
const restaurantStaffModel = require('../../models/restaurantStaffModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(restaurantStaffModel), restaurantStaffController.createStaff);
router.get("/dropdown", RestaurantAuthCheck, restaurantStaffController.dropDown);
router.get("/:id", RestaurantAuthCheck, restaurantStaffController.staffGetById);
router.get("/", RestaurantAuthCheck, restaurantStaffController.staffList);
router.put("/status/:id", RestaurantAuthCheck, restaurantStaffController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, restaurantStaffController.delete);

module.exports = router;
