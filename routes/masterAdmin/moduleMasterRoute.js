const express = require('express');
const router = express.Router()
const { validateSchema } = require("../../models/baseModel");
const { moduleMasterCtrl } = require('../../controllers/masterAdmin/moduleMasterCtrl');
const moduleMasterModel = require('../../models/moduleMasterModel');
const middleware = require("../../middlewares/middleware");


router.post("/create", middleware, validateSchema(moduleMasterModel), moduleMasterCtrl.createNewModule);
router.post('/update', middleware, moduleMasterCtrl.updateModule);
router.post('/list', middleware, moduleMasterCtrl.getModuleList);
router.post('/toggle-status', middleware, moduleMasterCtrl.toggleModuleStatus);
router.post('/get', middleware, moduleMasterCtrl.getModuleById);
router.post('/delete', middleware, moduleMasterCtrl.moduleDelete);


module.exports = router