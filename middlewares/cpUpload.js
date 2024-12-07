const multer = require("multer")
const fs = require("fs")
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dirPath = "uploads";
        if (file.fieldname === "restaurantLogo") {
            dirPath = "uploads/admin/restaurant/logo";
        }
        if (file.fieldname === "restaurantMedia" ) {
            dirPath = "uploads/admin/restaurant/restaurantMedia";
        }
        if (file.fieldname === "legalDoc") {
            dirPath = "uploads/admin/restaurant/legalDoc";
        }
        if (file.fieldname === "cImage") {
            dirPath = "uploads/product/category";
        }
        if (file.fieldname === "iImage") {
            dirPath = "uploads/product/ingrediance";
        }
        if (file.fieldname === "coverPicture" || file.fieldname === "profilePicture") {
            dirPath = "uploads/user/images";
        }
        if (file.fieldname === "modifierImage") {
            dirPath = "uploads/mofifier/images";
        }
        if (file.fieldname === "itemImage") {
            dirPath = "uploads/itemImage/images";
        }
        if (file.fieldname === "image") {
            dirPath = "uploads/cuisine/images";
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
const cpUpload = upload.fields([
    { name: "photos", maxCount: 15 },
    { name: "legalDoc", maxCount: 15 },
    { name: "restaurantMedia", maxCount: 15 },
    { name: "restaurantLogo", maxCount: 15 },
    { name: "storyphotos", maxCount: 15 },
    { name: "storyvideos", maxCount: 15 },
    { name: "videos", maxCount: 15 },
    { name: "documents", maxCount: 15 },
    { name: "profile_image", maxCount: 1 },
    { name: "profile_video", maxCount: 1 },
    { name: "vedioUrl", maxCount: 1 },
    { name: "function_video", maxCount: 1 },
    { name: "icon_image", maxCount: 1 },
    { name: "coverPicture", maxCount: 30 },
    { name: "modifierImage", maxCount: 1 },
    { name: "itemImage", maxCount: 1 },
    { name: "profilePicture", maxCount: 30 },
    { name: "logo", maxCount: 1 },
    { name: "Image", maxCount: 25 },
    { name: "image", maxCount: 25 },
    { name: "cImage", maxCount: 23 },
    { name: "iImage", maxCount: 23 }
]);

module.exports = cpUpload