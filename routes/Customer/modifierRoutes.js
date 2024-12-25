const express = require('express');

const router = express.Router()
const ModifierCtrl = require('../../controllers/Customer/modifierCtrl');
const CutomerAuthCheck = require("../../middlewares/cutomerAuthCheck");


router.get("/list/:restaurantId", CutomerAuthCheck, ModifierCtrl.List)



module.exports = router