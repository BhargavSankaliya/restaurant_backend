const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const RoleMasterModel = require('../../models/roleMasterModel');
const middleware = require("../../middlewares/middleware");
const { roleMasterController } = require('../../controllers/masterAdmin/roleMasterController');


router.post("", middleware, validateSchema(RoleMasterModel), roleMasterController.roleCreateUpdate);
router.get("", middleware, roleMasterController.roleList);
router.put('/status', middleware, roleMasterController.toggleRoleStatus);
router.get('/:id', middleware, roleMasterController.getRoleById);


module.exports = router