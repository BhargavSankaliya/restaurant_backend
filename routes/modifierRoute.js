const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { modifierController } = require('../controllers/modifierController');
const ModifierModel = require("../models/modifierModel");

router.post("/create-New-Modifier", validateSchema(ModifierModel), modifierController.createNewModifier);
router.post('/updateModifierById', modifierController.updateModifierById);
router.post('/getModifierList', modifierController.getModifierList);
router.post('/toggleModifireStatus', modifierController.toggleModifireStatus);
router.post('/getModifierById', modifierController.getModifierById);
router.post('/modifierDelete', modifierController.modifierDelete);


module.exports = router