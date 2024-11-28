const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { roleMasterController } = require('../controllers/roleMasterController');
const RoleMasterModel = require('../models/roleMasterModel');


//ads create and update api (if update then _id pass in query)
router.post("/create-New-Role", validateSchema(RoleMasterModel), roleMasterController.createNewRole);
router.post('/updateRoleById', roleMasterController.updateRoleById);
router.post('/getRoleList', roleMasterController.getRoleList);
router.post('/toggleRoleStatus', roleMasterController.toggleRoleStatus);
router.post('/getRoleById', roleMasterController.getRoleById);
router.post('/roleDelete', roleMasterController.roleDelete);


module.exports = router