const express = require('express');
const router = express.Router();
const { restaurantStaffController } = require('../../controllers/RestaurantAdmin/restaurantStaffController');
const { validateSchema } = require('../../models/baseModel');
const restaurantStaffModel = require('../../models/restaurantStaffModel');
const RestaurantAuthCheck = require("../../middlewares/restaurantAuthCheck");

router.post("/forgot-password", restaurantStaffController.forgotPassword);
router.post("/verify-otp", restaurantStaffController.verifyOTP);
router.post("/reset-pin", restaurantStaffController.resetPin);
router.post("/change-pin", restaurantStaffController.changePin);
router.get("/activeList", RestaurantAuthCheck, restaurantStaffController.activeList);
router.get("/deleteDocument", RestaurantAuthCheck, restaurantStaffController.deleteDocument);
router.post("/addDocument", RestaurantAuthCheck, restaurantStaffController.addDocument);
router.post("/", RestaurantAuthCheck, validateSchema(restaurantStaffModel), restaurantStaffController.createStaff);
router.get("/documentList/:id", RestaurantAuthCheck, restaurantStaffController.documentList);
router.get("/:id", RestaurantAuthCheck, restaurantStaffController.staffGetById);
router.get("/", RestaurantAuthCheck, restaurantStaffController.staffList);
router.put("/status/:id", RestaurantAuthCheck, restaurantStaffController.toggleStatus);
router.delete("/:id", RestaurantAuthCheck, restaurantStaffController.delete);

module.exports = router;
