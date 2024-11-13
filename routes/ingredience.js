const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { ingredienceController } = require('../controllers/ingredienceController');
const categoryModel = require('../models/category');


//ads create and update api (if update then _id pass in query)
router.post("/create-ingredience", ingredienceController.creatIengredience)
router.post("/update-ingredience", ingredienceController.updateIngredienceById);
router.get("/ingredienceGetById/:ingredienceId" , ingredienceController.ingredienceGetById)
router.get("/ingredienceList",ingredienceController.IngredienceList)
router.get("/activeingredienceList",ingredienceController.activeIngredienceList)


module.exports = router