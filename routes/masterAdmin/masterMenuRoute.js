const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const middleware = require("../../middlewares/middleware");
const { menuMasterController } = require('../../controllers/masterAdmin/menuMasterController');
const MasterMenu = require('../../models/masterMenuModel');


router.post("", middleware, validateSchema(MasterMenu), menuMasterController.menuCreateUpdate);
router.get("", middleware, menuMasterController.menuList);
router.put('/status', middleware, menuMasterController.updateMenuStatus);
router.get('/:id', middleware, menuMasterController.getMenuById);


module.exports = router