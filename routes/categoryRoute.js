const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { categoryController } = require('../controllers/categoryController');
const categoryModel = require('../models/category');
const middleware = require("../middlewares/middleware");


router.post("/create-Category", middleware, validateSchema(categoryModel), categoryController.createCategory)
router.post("/update-Category", middleware, categoryController.updateCategoryById);
router.post("/categortGetById", middleware, categoryController.categoryGetById)
router.get("/categoryList", middleware, categoryController.categoryList)
router.get("/activeCategoryList", middleware, categoryController.activeCategoryList)


module.exports = router