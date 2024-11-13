const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { unitofsalesController } = require('../controllers/unitOfSalesController');
// const categoryModel = require('../models/category');


//ads create and update api (if update then _id pass in query)
router.post("/create-UnitOfSales", unitofsalesController.createUnitOfSales)
router.post("/update-UnitOfSales", unitofsalesController.updateUnitOfSalesById);
router.get("/UnitOfSalesGetById/:UnitOfSalesId" , unitofsalesController.UnitOfSalesGetById)
router.get("/UnitOfSalesList",unitofsalesController.unitOfSalesList)
router.get("/activeUnitOfSalesList",unitofsalesController.activeUnitOfSalesList)


module.exports = router