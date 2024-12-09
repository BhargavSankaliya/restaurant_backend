const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { categoryController } = require('../../controllers/RestaurantAdmin/categoryController');
const categoryModel = require('../../models/category');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");


router.post("/", RestaurantAuthCheck, validateSchema(categoryModel), categoryController.createCategory)
router.get("/:id", RestaurantAuthCheck, categoryController.categoryGetById)
router.get("/", RestaurantAuthCheck, categoryController.categoryList)
router.put("/status/:id", RestaurantAuthCheck, categoryController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, categoryController.delete);



module.exports = router