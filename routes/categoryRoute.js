const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { categoryController } = require('../controllers/categoryController');
const categoryModel = require('../models/category');


//ads create and update api (if update then _id pass in query)
router.post("/create-Category", categoryController.createCategory)
router.post("/update-Category", categoryController.updateCategoryById);
router.get("/categortGetById/:categoryId" , categoryController.categoryGetById)
router.get("/categoryList",categoryController.categoryList)
router.get("/activeCategoryList",categoryController.activeCategoryList)


module.exports = router