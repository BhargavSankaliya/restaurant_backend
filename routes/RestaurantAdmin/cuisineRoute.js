const express = require('express');
const router = express.Router();
const { cuisineController } = require('../../controllers/RestaurantAdmin/cuisineController');
const { validateSchema } = require('../../models/baseModel');
const CuisineModel = require('../../models/cuisineModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(CuisineModel), cuisineController.createCuisine);
router.get("/:id", RestaurantAuthCheck, cuisineController.cuisineGetById);
router.get("/", RestaurantAuthCheck, cuisineController.cuisineList);
router.put("/status/:id", RestaurantAuthCheck, cuisineController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, cuisineController.delete);

module.exports = router;
