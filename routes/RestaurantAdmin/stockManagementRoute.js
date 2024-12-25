const express = require('express');
const router = express.Router();
const { stockManagementController } = require('../../controllers/RestaurantAdmin/stockManagementController');
const { validateSchema } = require('../../models/baseModel');
const StockManagementModel = require('../../models/stockManagementModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(StockManagementModel), stockManagementController.createStock);
router.get("/dropdown", RestaurantAuthCheck, stockManagementController.dropDown);
router.get("/:id", RestaurantAuthCheck, stockManagementController.stockGetById);
router.get("/", RestaurantAuthCheck, stockManagementController.stockList);
router.put("/status/:id", RestaurantAuthCheck, stockManagementController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, stockManagementController.delete);

module.exports = router;
