const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { authController } = require('../controllers/authController');
const UserModel = require('../models/userModel');
const middleware = require("../middlewares/middleware");


router.post("/userLogin", authController.userLogin);

router.post("/create-user", middleware, validateSchema(UserModel), authController.createUser);
router.post('/updateUserById', middleware, authController.updateUserById);
router.post('/getUsersList', middleware, authController.getUsersList);
router.post('/toggleUserStatus', middleware, authController.toggleUserStatus);
router.post('/getUserById', middleware, authController.getUserById);


module.exports = router