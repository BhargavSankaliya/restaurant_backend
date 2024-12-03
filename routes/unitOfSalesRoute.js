const express = require('express');
const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { unitofsalesController } = require('../controllers/unitOfSalesController');
const UnitOfSalesModel = require('../models/unitOfSales');
const middleware = require("../middlewares/middleware");


router.post("/create-UnitOfSales", middleware, validateSchema(UnitOfSalesModel), unitofsalesController.createUnitOfSales)
router.post("/update-UnitOfSales", middleware, unitofsalesController.updateUnitOfSalesById);
router.post("/UnitOfSalesGetById", middleware, unitofsalesController.UnitOfSalesGetById)
router.post("/UnitOfSalesList", middleware, unitofsalesController.unitOfSalesList)
router.get("/activeUnitOfSalesList", middleware, unitofsalesController.activeUnitOfSalesList)


module.exports = router