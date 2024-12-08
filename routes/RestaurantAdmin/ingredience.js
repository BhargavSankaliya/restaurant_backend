const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { ingredienceController } = require('../../controllers/RestaurantAdmin/ingredienceController');
const ingredienceModel = require('../../models/ingredience');
const restaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const restaurantCpUpload = require("../../middlewares/restaurantCpUpload")


router.post("/", restaurantAuthCheck, validateSchema(ingredienceModel), restaurantCpUpload, ingredienceController.creatIengredience)
router.get("/:id", restaurantAuthCheck, ingredienceController.ingredienceGetById)
router.get("/", restaurantAuthCheck, ingredienceController.IngredienceList)
router.put("/status/:id", restaurantAuthCheck, ingredienceController.toggleStatus);
router.delete("/:id", ingredienceController.delete);



module.exports = router