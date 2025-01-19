const express = require('express');

const router = express.Router()
const ItemCtrl = require('../../controllers/Customer/ItemCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/list/:categoryId", ItemCtrl.List);

router.get("/ingredientList", ItemCtrl.ingredientById);



module.exports = router