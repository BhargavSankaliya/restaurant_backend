const express = require('express');

const router = express.Router()
const { FileUpload } = require('../../controllers/masterAdmin/fileUpload');

router.post("/file-upload",FileUpload)


module.exports = router