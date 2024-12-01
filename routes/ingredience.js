const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { ingredienceController } = require('../controllers/ingredienceController');
const categoryModel = require('../models/category');
const middleware = require("../middlewares/middleware");


router.post("/create-ingredience", middleware, ingredienceController.creatIengredience)
router.post("/update-ingredience", middleware, ingredienceController.updateIngredienceById);
router.get("/ingredienceGetById/:ingredienceId", middleware, ingredienceController.ingredienceGetById)
router.get("/ingredienceList", middleware, ingredienceController.IngredienceList)
router.get("/activeingredienceList", middleware, ingredienceController.activeIngredienceList)


module.exports = router