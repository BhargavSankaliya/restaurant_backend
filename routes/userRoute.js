const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { authController } = require('../controllers/authController');
const UserModel = require('../models/userModel');


router.post("/userLogin", authController.userLogin);

router.post("/create-user", validateSchema(UserModel), authController.createUser);
router.post('/updateUserById', authController.updateUserById);
router.post('/getUsersList', authController.getUsersList);
router.post('/toggleUserStatus', authController.toggleUserStatus);
router.post('/getUserById', authController.getUserById);


module.exports = router