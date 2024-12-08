const express = require('express');
const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { unitofsalesController } = require('../../controllers/RestaurantAdmin/unitOfSalesController');
const UnitOfSalesModel = require('../../models/unitOfSales');
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");


router.post("/", restaurantAuthCheck, validateSchema(UnitOfSalesModel), unitofsalesController.createUnitOfSales)
router.get("/:id", restaurantAuthCheck, unitofsalesController.UnitOfSalesGetById)
router.get("/", restaurantAuthCheck, unitofsalesController.unitOfSalesList)
router.put("/status/:id", restaurantAuthCheck, unitofsalesController.toggleStatus);
router.delete("/:id", unitofsalesController.delete);


module.exports = router