const express = require('express');

const router = express.Router()
const CategoryCtrl = require('../../controllers/Customer/categoryCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/list/:restaurantId", CutomerAuthCheck, CategoryCtrl.List)



module.exports = router