const express = require('express');

const router = express.Router()
const ItemCtrl = require('../../controllers/Customer/ItemCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/list/:categoryId", CutomerAuthCheck, ItemCtrl.List)



module.exports = router