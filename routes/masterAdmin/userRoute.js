const express = require('express');

const router = express.Router()
const { validateSchema } = require('../../models/baseModel');
const { authController } = require('../../controllers/authController');
const MasterUserModel = require('../../models/userModel.js');
const middleware = require("../../middlewares/middleware");


router.post("/user-login", authController.userLogin);

// create and update user details
router.post("", middleware, validateSchema(MasterUserModel), authController.createUser);

router.get("", middleware, authController.getUsersList);

router.put('/status', middleware, authController.toggleUserStatus);

router.get('/:id', middleware, authController.getUserById);


module.exports = router