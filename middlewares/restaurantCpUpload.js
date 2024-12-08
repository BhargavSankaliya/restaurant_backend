const multer = require("multer")
const fs = require("fs")
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dirPath = "uploads";
        if (file.fieldname === "ingredienceImage") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/ingredience`
        }
        if (file.fieldname === "cuisineImage") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/cuisine`
        }

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        cb(null, dirPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

// Create upload middleware
const upload = multer({ storage: storage });

// Define upload fields
const restaurantCpUpload = upload.fields([
    { name: "ingredienceImage", maxCount: 15 },
    { name: "cuisineImage", maxCount: 15 },
]);

module.exports = restaurantCpUpload