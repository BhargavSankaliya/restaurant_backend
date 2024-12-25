const express = require('express');
const router = express.Router();
const { OfferController } = require('../../controllers/RestaurantAdmin/OfferController');
const { validateSchema } = require('../../models/baseModel');
const OfferModel = require('../../models/OfferModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(OfferModel), OfferController.createOffer);
router.get("/dropdown", RestaurantAuthCheck, OfferController.dropDown);
router.get("/:id", RestaurantAuthCheck, OfferController.OfferGetById);
router.get("/", RestaurantAuthCheck, OfferController.OfferList);
router.put("/status/:id", RestaurantAuthCheck, OfferController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, OfferController.delete);

module.exports = router;
