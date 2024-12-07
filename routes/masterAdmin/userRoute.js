const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { authController } = require('../../controllers/masterAdmin/authController.js');
const MasterUserModel = require('../../models/userModel.js');
const middleware = require("../../middlewares/middleware");


router.post("/login", authController.userLogin);

// create and update user details
router.post("", middleware, validateSchema(MasterUserModel), authController.createUser);

router.get("", middleware, authController.getUsersList);

router.put('/status', middleware, authController.toggleUserStatus);

router.get('/:id', middleware, authController.getUserById);

router.post("/forgot-password", authController.forgotPassword)
router.post("/verify-otp", authController.verifyOTP)
router.post("/reset-password", authController.resetPassword)

router.post("/change-password", middleware, authController.changePassword)

module.exports = router