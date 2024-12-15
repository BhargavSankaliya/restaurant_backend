const express = require('express');
const router = express.Router();
const { stockHistoryController } = require('../../controllers/RestaurantAdmin/stockHistoryController');
const { validateSchema } = require('../../models/baseModel');
const StockHistoryModel = require('../../models/stockHistoryModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/", RestaurantAuthCheck, validateSchema(StockHistoryModel), stockHistoryController.createStockHistory);
router.get("/dropdown", RestaurantAuthCheck, stockHistoryController.dropDown);
router.get("/:id", RestaurantAuthCheck, stockHistoryController.stockHistoryGetById);
router.get("/", RestaurantAuthCheck, stockHistoryController.stockHistoryList);
router.put("/status/:id", RestaurantAuthCheck, stockHistoryController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, stockHistoryController.delete);

module.exports = router;
