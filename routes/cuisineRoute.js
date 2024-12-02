const express = require('express');

const router = express.Router();
const { cuisineController } = require('../controllers/cuisineController');
const { validateSchema } = require('../models/baseModel');
const CuisineModel = require('../models/cuisineModel');
const middleware = require("../middlewares/middleware");

router.post("/create-cuisine", middleware, validateSchema(CuisineModel), cuisineController.createCuisine);
router.post("/update-cuisine", middleware, cuisineController.updateCuisineById);
router.post("/cuisineGetById", middleware, cuisineController.cuisineGetById);
router.get("/cuisineList", middleware, cuisineController.cuisineList);
router.get("/activeCuisineList", middleware, cuisineController.activeCuisineList);

module.exports = router;
