const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const RestaurantPosterCtrl = require('../../controllers/RestaurantAdmin/restaurantPosterCtrl');
const RestaurantPosterModel = require('../../models/restaurantPosterModel');


router.post("/", restaurantAuthCheck, validateSchema(RestaurantPosterModel), RestaurantPosterCtrl.addEdit);
router.get("/", restaurantAuthCheck, RestaurantPosterCtrl.list);
router.put('/status/:id', restaurantAuthCheck, RestaurantPosterCtrl.toggleStatus);
router.delete('/:id', restaurantAuthCheck, RestaurantPosterCtrl.delete);
router.get('/:id', restaurantAuthCheck, RestaurantPosterCtrl.getById);


module.exports = router