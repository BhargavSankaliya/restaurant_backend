const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { authController } = require('../controllers/authController');
const UserModel = require('../models/userModel');


//ads create and update api (if update then _id pass in query)
router.post("/create-user", validateSchema(UserModel), authController.createUser);
router.post('/updateUserById/:id',authController.updateUserById);
router.get('/getUsersByStatus', authController.getUsersByStatus);
router.post('/toggleUserStatus/:id', authController.toggleUserStatus);
router.get('/getUserById/:id', authController.getUserById);


module.exports = router