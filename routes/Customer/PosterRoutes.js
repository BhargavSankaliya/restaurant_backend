const express = require('express');

const router = express.Router()
const PosterCtrl = require('../../controllers/Customer/PosterCtrl'); 
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/:restaurantId", CutomerAuthCheck, PosterCtrl.list)



module.exports = router