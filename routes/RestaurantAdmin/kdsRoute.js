const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { kdsController } = require('../../controllers/RestaurantAdmin/kdsController');
const kdsModel = require("../../models/kdsModel");
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(kdsModel), kdsController.createNewKds);
router.get('/', RestaurantAuthCheck, kdsController.getKdsList);
router.get('/:id', RestaurantAuthCheck, kdsController.getKdsById);
router.put("/status/:id", RestaurantAuthCheck, kdsController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, kdsController.delete);


module.exports = router