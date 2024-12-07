const express = require('express');
const FileUploadCtrl = require("../../controllers/masterAdmin/fileUpload");
const router = express.Router();
const middleware = require("../../middlewares/middleware");
const cpUploads = require("../../middlewares/cpUpload")

router.post('/', middleware, cpUploads, FileUploadCtrl.FileUpload);



module.exports = router