const express = require('express');
const router = express.Router()
const { validateSchema } = require("../../models/baseModel");
const { moduleMasterCtrl } = require('../../controllers/masterAdmin/moduleMasterCtrl');
const moduleMasterModel = require('../../models/masterAdmin/moduleMasterModel');
const middleware = require("../../middlewares/middleware");


router.post("/createNewModule", middleware, validateSchema(moduleMasterModel), moduleMasterCtrl.createNewModule);
router.post('/updateModule', middleware, moduleMasterCtrl.updateModule);
router.post('/getModuleList', middleware, moduleMasterCtrl.getModuleList);
router.post('/toggleModuleStatus', middleware, moduleMasterCtrl.toggleModuleStatus);
router.post('/getModuleById', middleware, moduleMasterCtrl.getModuleById);
router.post('/moduleDelete', middleware, moduleMasterCtrl.moduleDelete);


module.exports = router