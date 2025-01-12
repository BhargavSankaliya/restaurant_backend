const express = require('express');

const router = express.Router()
const CategoryCtrl = require('../../controllers/Customer/categoryCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/list/:restaurantId", CategoryCtrl.List)



module.exports = router