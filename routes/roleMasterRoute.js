const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { roleMasterController } = require('../controllers/roleMasterController');
const RoleMasterModel = require('../models/roleMasterModel');
const middleware = require("../middlewares/middleware");


router.post("/create-New-Role", middleware, validateSchema(RoleMasterModel), roleMasterController.createNewRole);
router.post('/updateRoleById', middleware, roleMasterController.updateRoleById);
router.post('/getRoleList', middleware, roleMasterController.getRoleList);
router.post('/toggleRoleStatus', middleware, roleMasterController.toggleRoleStatus);
router.post('/getRoleById', middleware, roleMasterController.getRoleById);
router.post('/roleDelete', middleware, roleMasterController.roleDelete);


module.exports = router