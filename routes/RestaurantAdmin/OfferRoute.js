const express = require('express');
const router = express.Router();
const { validateSchema } = require('../../models/baseModel');
const OfferModel = require('../../models/offerModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const { offerController } = require('../../controllers/RestaurantAdmin/offerController');

router.post("/", RestaurantAuthCheck, validateSchema(OfferModel), offerController.createOffer);
router.get("/dropdown", RestaurantAuthCheck, offerController.dropDown);
router.get("/:id", RestaurantAuthCheck, offerController.OfferGetById);
router.get("/", RestaurantAuthCheck, offerController.OfferList);
router.put("/status/:id", RestaurantAuthCheck, offerController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, offerController.delete);

module.exports = router;
