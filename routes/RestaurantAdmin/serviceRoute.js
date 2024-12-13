const express = require('express');
const router = express.Router();
const { serviceController } = require('../../controllers/RestaurantAdmin/serviceController');
const { validateSchema } = require('../../models/baseModel');
const ServiceModel = require('../../models/serviceModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(ServiceModel), serviceController.createService);
router.get("/dropdown", RestaurantAuthCheck, serviceController.dropDown);
router.get("/:id", RestaurantAuthCheck, serviceController.serviceGetById);
router.get("/", RestaurantAuthCheck, serviceController.serviceList);
router.put("/status/:id", RestaurantAuthCheck, serviceController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, serviceController.delete);

module.exports = router;
