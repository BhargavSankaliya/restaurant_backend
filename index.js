const express = require("express");
const connectDB = require("./database/db");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const categoryRoute = require("./routes/categoryRoute");
const unitOfSalesRoute = require("./routes/unitOfSalesRoute")
const ingredienceRoute = require("./routes/ingredience")
const cuisineRoute = require("./routes/cuisineRoute")
const modifierRoute = require("./routes/modifierRoute")
const itemsRoute = require("./routes/itemsRoute")
const { errorHandler } = require("./middlewares/error");
const verifyToken = require("./middlewares/verifyToken");
//const config = require("./environmentVariable.json");
const config = require('./config/index')
const cors = require("cors");

//Master Admin
const userRoute = require("./routes/masterAdmin/userRoute");
const masterAdminModuleMasterRoute = require("./routes/masterAdmin/moduleMasterRoute")
const masterMenuRoute = require("./routes/masterAdmin/masterMenuRoute")
const roleMasterRoute = require("./routes/masterAdmin/roleMasterRoute")
const fileUploadMaster = require("./routes/masterAdmin/fileUpload")
const RestaurantMasterRoute = require("./routes/masterAdmin/restaurantMasterRoute")


dotenv.config();
app.use(cors());
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ limit: "2gb", extended: true }));
app.use(cookieParser());


// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//master Admin 
app.use("/api/master-admin", userRoute);
app.use("/api/master-admin/menu", masterMenuRoute);
app.use("/api/master-admin/role", roleMasterRoute);
app.use("/api/master-admin/restaurant", RestaurantMasterRoute);
app.use("/api/master-admin/file-upload", fileUploadMaster)
app.use("/api/master-admin/module", masterAdminModuleMasterRoute);

app.use("/api/unitOfSalesRoute", unitOfSalesRoute);
app.use("/api/ingredienceRoute", ingredienceRoute);
app.use("/api/cuisineRoute", cuisineRoute);
app.use("/api/category", categoryRoute);

// By Meet 
app.use("/api/modifier", modifierRoute);
app.use("/api/item", itemsRoute);


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
