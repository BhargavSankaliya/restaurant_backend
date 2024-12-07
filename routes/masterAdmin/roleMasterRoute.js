const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { roleMasterController } = require('../../controllers/roleMasterController');
const RoleMasterModel = require('../../models/roleMasterModel');
const middleware = require("../../middlewares/middleware");


router.post("", middleware, validateSchema(RoleMasterModel), roleMasterController.roleCreateUpdate);
router.get("", middleware, roleMasterController.roleList);
router.put('/status', middleware, roleMasterController.toggleRoleStatus);
router.get('/:id', middleware, roleMasterController.getRoleById);


module.exports = router