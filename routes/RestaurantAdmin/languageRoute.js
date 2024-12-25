const express = require('express');
const router = express.Router();
const { languageController } = require('../../controllers/RestaurantAdmin/languageController');
const { validateSchema } = require('../../models/baseModel');
const languageModel = require('../../models/languageModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(languageModel), languageController.createLanguage);
router.get("/dropdown", RestaurantAuthCheck, languageController.dropDown);
router.get("/:id", RestaurantAuthCheck, languageController.languageGetById);
router.get("/", RestaurantAuthCheck, languageController.languageList);
router.put("/status/:id", RestaurantAuthCheck, languageController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, languageController.delete);

module.exports = router;
