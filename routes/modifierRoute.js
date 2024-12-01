const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { modifierController } = require('../controllers/modifierController');
const ModifierModel = require("../models/modifierModel");
const middleware = require("../middlewares/middleware");

router.post("/create-New-Modifier", middleware, validateSchema(ModifierModel), modifierController.createNewModifier);
router.post('/updateModifierById', middleware, modifierController.updateModifierById);
router.post('/getModifierList', middleware, modifierController.getModifierList);
router.post('/toggleModifireStatus', middleware, modifierController.toggleModifireStatus);
router.post('/getModifierById', middleware, modifierController.getModifierById);
router.post('/modifierDelete', middleware, modifierController.modifierDelete);


module.exports = router