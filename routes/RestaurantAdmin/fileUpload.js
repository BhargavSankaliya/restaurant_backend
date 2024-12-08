const express = require('express');
const FileUploadCtrl = require("../../controllers/RestaurantAdmin/fileUpload");
const router = express.Router();
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");
const restaurantCpUpload = require("../../middlewares/restaurantCpUpload")

router.post('/', RestaurantAuthCheck, restaurantCpUpload, FileUploadCtrl.FileUpload);



module.exports = router