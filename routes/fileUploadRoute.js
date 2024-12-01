const express = require('express');
const { FileUpload } = require('../controllers/authController');
const router = express.Router();
const middleware = require("../middlewares/middleware");


router.post('/file-upload', middleware, FileUpload);



module.exports = router