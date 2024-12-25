const express = require('express');
const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const CashierCtrl = require('../../controllers/RestaurantAdmin/CashierCtrl');
const CashierModel = require('../../models/CashierModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");


router.post("/", RestaurantAuthCheck, validateSchema(CashierModel), CashierCtrl.createUpdate)
router.get("/", RestaurantAuthCheck,  CashierCtrl.list)
router.get("/:id", RestaurantAuthCheck,  CashierCtrl.getById)
router.put("/status/:id", RestaurantAuthCheck,  CashierCtrl.toggleStatus)
router.delete("/:id", RestaurantAuthCheck,  CashierCtrl.delete)



module.exports = router