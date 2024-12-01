const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { itemsController } = require('../controllers/itemsController');
const ItemsModel = require("../models/itemsModel");
const middleware = require("../middlewares/middleware");

router.post("/create-New-Item", middleware, validateSchema(ItemsModel), itemsController.createNewItem);
router.post('/updateItemById', middleware, itemsController.updateItemById);
router.post('/getItemList', middleware, itemsController.getItemList);
router.post('/toggleItemStatus', middleware, itemsController.toggleItemStatus);
router.post('/getItemById', middleware, itemsController.getItemById);
router.post('/itemDelete', middleware, itemsController.itemDelete);


module.exports = router