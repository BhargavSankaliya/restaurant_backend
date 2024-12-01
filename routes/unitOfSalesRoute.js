const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { unitofsalesController } = require('../controllers/unitOfSalesController');
// const categoryModel = require('../models/category');
const middleware = require("../middlewares/middleware");


router.post("/create-UnitOfSales", middleware, unitofsalesController.createUnitOfSales)
router.post("/update-UnitOfSales", middleware, unitofsalesController.updateUnitOfSalesById);
router.get("/UnitOfSalesGetById/:UnitOfSalesId", middleware, unitofsalesController.UnitOfSalesGetById)
router.get("/UnitOfSalesList", middleware, unitofsalesController.unitOfSalesList)
router.get("/activeUnitOfSalesList", middleware, unitofsalesController.activeUnitOfSalesList)


module.exports = router