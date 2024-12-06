const express = require("express");
const connectDB = require("./database/db");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRoute = require("./routes/userRoute");
const categoryRoute = require("./routes/categoryRoute");
const unitOfSalesRoute = require("./routes/unitOfSalesRoute")
const ingredienceRoute = require("./routes/ingredience")
const cuisineRoute = require("./routes/cuisineRoute")
const roleMasterRoute = require("./routes/roleMasterRoute")
const modifierRoute = require("./routes/modifierRoute")
const itemsRoute = require("./routes/itemsRoute")
const masterAdminModuleMasterRoute = require("./routes/masterAdmin/moduleMasterRoute")
const { errorHandler } = require("./middlewares/error");
const verifyToken = require("./middlewares/verifyToken");
//const config = require("./environmentVariable.json");
const config = require('./config/index')
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

dotenv.config();
app.use(cors());
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ limit: "2gb", extended: true }));
app.use(cookieParser());

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dirPath = "uploads";
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

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/userRoute", cpUpload, userRoute);
app.use("/api/category", cpUpload, categoryRoute);
app.use("/api/unitOfSalesRoute", cpUpload, unitOfSalesRoute);
app.use("/api/ingredienceRoute", cpUpload, ingredienceRoute);
app.use("/api/cuisineRoute", cpUpload, cuisineRoute);

// By Meet 
app.use("/api/roleMaster", roleMasterRoute);
app.use("/api/modifier", cpUpload, modifierRoute);
app.use("/api/item", cpUpload, itemsRoute);

app.use("/api/masterAdmin/module", masterAdminModuleMasterRoute);

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    data: null,
    meta: {
      success: false,
      status: err.status || 500,
      message: err.message || "Internal Server Error",
      timestamp: new Date().toISOString(),
    },
  });
});
app.use(errorHandler);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Create HTTP server
const http = require("http");
let server = http.createServer(app);
app.set("port", process.env.PORT || config.PORT);

server.listen(config.server.port, () => {
  connectDB();
  console.log(`Server is running on port ${config.server.port} in ${process.env.NODE_ENV} mode`);
});
