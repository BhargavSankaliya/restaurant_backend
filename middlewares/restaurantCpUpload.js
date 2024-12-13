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
        if (file.fieldname === "categoryImage") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/category`
        }
        if (file.fieldname === "modifierImage") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/modifier`
        }
        if (file.fieldname === "restaurantMenuIcon") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/restaurantMenu`
        }
        if (file.fieldname === "restaurantServiceImage") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/restaurantServiceImage`
        }
        if (file.fieldname === "restaurantStockImage") {
            dirPath = `uploads/restaurant/${req.restaurant._id.toString()}/restaurantStockImage`
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
    { name: "categoryImage", maxCount: 15 },
    { name: "modifierImage", maxCount: 15 },
    { name: "restaurantMenuIcon", maxCount: 15 },
    { name: "restaurantServiceImage", maxCount: 15 },
    { name: "restaurantStockImage", maxCount: 15 },
]);

module.exports = restaurantCpUpload