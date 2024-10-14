const express = require('express');

const router = express.Router()
const { validateSchema } = require('../models/baseModel');
const { authController } = require('../controllers/authController');
const UserModel = require('../models/userModel');


//ads create and update api (if update then _id pass in query)
router.post("/create-update", validateSchema(UserModel), authController.createUpdateStore);


module.exports = router