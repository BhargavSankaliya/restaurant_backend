const express = require('express');

const router = express.Router();
const { cuisineController } = require('../controllers/cuisineController'); // Adjust the path
const CuisineModel = require('../models/cuisineModel'); // Adjust the path if necessary

// Create and update API (for update, pass _id in the request body)
router.post("/create-cuisine", cuisineController.createCuisine);
router.post("/update-cuisine", cuisineController.updateCuisineById);
router.get("/cuisineGetById/:cuisineId", cuisineController.cuisineGetById);
router.get("/cuisineList", cuisineController.cuisineList);
router.get("/activeCuisineList", cuisineController.activeCuisineList);

module.exports = router;
