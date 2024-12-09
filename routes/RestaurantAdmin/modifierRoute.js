const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { modifierController } = require('../../controllers/RestaurantAdmin/modifierController');
const ModifierModel = require("../../models/modifierModel");
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(ModifierModel), modifierController.createNewModifier);
router.get('/', RestaurantAuthCheck, modifierController.getModifierList);
router.get('/:id', RestaurantAuthCheck, modifierController.getModifierById);
router.put("/status/:id", RestaurantAuthCheck, modifierController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, modifierController.delete);


module.exports = router