const express = require("express");
const connectDB = require("./database/db");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const { errorHandler } = require("./middlewares/error");
const verifyToken = require("./middlewares/verifyToken");
//const config = require("./environmentVariable.json");
const config = require('./config/index')
const cors = require("cors");
const { socketConnection } = require('./socket.js')
const { startEventListener } = require('./events/eventListners.js')
const customerAuth = require("./middlewares/cutomerAuthCheck.js");

//Master Admin
const userRoute = require("./routes/masterAdmin/userRoute");
const masterAdminModuleMasterRoute = require("./routes/masterAdmin/moduleMasterRoute")
const masterMenuRoute = require("./routes/masterAdmin/masterMenuRoute")
const roleMasterRoute = require("./routes/masterAdmin/roleMasterRoute")
const fileUploadMaster = require("./routes/masterAdmin/fileUpload")
const RestaurantMasterRoute = require("./routes/masterAdmin/restaurantMasterRoute")

//Restaurant Admin
const restaurantAuthRoute = require("./routes/RestaurantAdmin/restaurantAuthRoute")
const restaurantFileUpload = require("./routes/RestaurantAdmin/fileUpload")
const itemsRoute = require("./routes/RestaurantAdmin/itemsRoute")
const categoryRoute = require("./routes/RestaurantAdmin/categoryRoute");
const unitOfSalesRoute = require("./routes/RestaurantAdmin/unitOfSalesRoute")
const ingredienceRoute = require("./routes/RestaurantAdmin/ingredience")
const cuisineRoute = require("./routes/RestaurantAdmin/cuisineRoute")
const modifierRoute = require("./routes/RestaurantAdmin/modifierRoute")
const kdsRoute = require("./routes/RestaurantAdmin/kdsRoute")
const restaurantRole = require("./routes/RestaurantAdmin/restaurantRoleRoute")
const restaurantMenuRoute = require("./routes/RestaurantAdmin/restaurantMenuRoute")
const restaurantTableRoute = require("./routes/RestaurantAdmin/restaurantTableRoute")
const restaurantStaffRoute = require("./routes/RestaurantAdmin/restaurantStaffRoute")
const paymentMethodRoute = require("./routes/RestaurantAdmin/paymentMethodRoute")
const serviceMethodRoute = require("./routes/RestaurantAdmin/serviceRoute")
const languageMethodRoute = require("./routes/RestaurantAdmin/languageRoute")
const stockManagementMethodRoute = require("./routes/RestaurantAdmin/stockManagementRoute")
const stockHistoryRoute = require("./routes/RestaurantAdmin/stockHistoryRoute")
const couponRoute = require("./routes/RestaurantAdmin/couponRoute")
const OfferRoute = require("./routes/RestaurantAdmin/OfferRoute")
const RestaurantPosterRoute = require("./routes/RestaurantAdmin/restaurantPosterRoute.js")
// const RestaurantCashierRoute = require("./routes/RestaurantAdmin/CashierRoute.js")

//customer 
const CustomerAuthRoute = require("./routes/Customer/customerAuthRoutes.js")
const CustomerCategoryRoute = require("./routes/Customer/categoryRoutes.js")
const CustomerItemRoute = require("./routes/Customer/ItemRoutes.js")
const CustomerModifierRoute = require("./routes/Customer/modifierRoutes.js")
const CustomerAddToCartRoute = require("./routes/Customer/addToCartRoutes.js")
const CustomerPosterRoute = require("./routes/Customer/PosterRoutes.js")
const CustomerPlaceOrderRoute = require("./routes/Customer/orderRoutes.js")
const CustomerCouponRoute = require("./routes/Customer/couponRoutes.js")

//Cashier
const CashierAuthRoute = require("./routes/Cashier/CashierAuthRoute.js")
const CashierRestaurantRoute = require("./routes/Cashier/CashierRestaurantRoute.js")
const CashierPlaceOrderRoute = require("./routes/Cashier/orderRoutes.js")
const CashierAddToCartRoute = require("./routes/Cashier/addToCartRoutes.js")

dotenv.config();
app.use(cors());
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ limit: "2gb", extended: true }));
app.use(cookieParser());


// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//master Admin 
app.use("/api/master-admin", userRoute);
app.use("/api/master-admin-menu", masterMenuRoute);
app.use("/api/master-admin-role", roleMasterRoute);
app.use("/api/master-admin-restaurant", RestaurantMasterRoute);
app.use("/api/master-admin-file-upload", fileUploadMaster)
app.use("/api/master-admin-module", masterAdminModuleMasterRoute);


//Restaurant Admin
app.use("/api/restaurant-admin", restaurantAuthRoute)
app.use("/api/restaurant-admin-unitOfSales", unitOfSalesRoute);
app.use("/api/restaurant-admin-file-upload", restaurantFileUpload);
app.use("/api/restaurant-admin-ingredience", ingredienceRoute);
app.use("/api/restaurant-admin-cuisine", cuisineRoute);
app.use("/api/restaurant-admin-category", categoryRoute);
app.use("/api/restaurant-admin-modifier", modifierRoute);
app.use("/api/restaurant-admin-item", itemsRoute);
app.use("/api/restaurant-admin-kds", kdsRoute);
app.use("/api/restaurant-admin-role", restaurantRole);
app.use("/api/restaurant-admin-menu", restaurantMenuRoute);
app.use("/api/restaurant-admin-table", restaurantTableRoute);
app.use("/api/restaurant-admin-staff", restaurantStaffRoute);
app.use("/api/restaurant-admin-payment-method", paymentMethodRoute);
app.use("/api/restaurant-admin-service", serviceMethodRoute);
app.use("/api/restaurant-admin-language", languageMethodRoute);
app.use("/api/restaurant-admin-stock-management", stockManagementMethodRoute);
app.use("/api/restaurant-admin-stock-history", stockHistoryRoute);
app.use("/api/restaurant-admin-coupon", couponRoute);
app.use("/api/restaurant-admin-offer", OfferRoute);
app.use("/api/restaurant-admin-poster", RestaurantPosterRoute);


//Customer Rooutes
app.use("/api/customer", CustomerAuthRoute)
app.use("/api/customer-category", CustomerCategoryRoute)
app.use("/api/customer-item", CustomerItemRoute)
app.use("/api/customer-modifier", CustomerModifierRoute)
app.use("/api/customer-add-to-cart", CustomerAddToCartRoute)
app.use("/api/customer-poster", CustomerPosterRoute)
app.use("/api/customer-coupons", CustomerCouponRoute)
app.use("/api/customer-place-order", CustomerPlaceOrderRoute)

// Cashier Routes
app.use("/api/cashier", CashierAuthRoute)
app.use("/api/cashier-restaurant", CashierRestaurantRoute)
app.use("/api/cashier-place-order", CashierPlaceOrderRoute)
app.use("/api/cashier-add-to-cart", CashierAddToCartRoute)

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

Promise.all([
  socketConnection(server),
  startEventListener()
]);

server.listen(config.server.port, () => {
  connectDB();
  console.log(`Server is running on port ${config.server.port} in ${process.env.NODE_ENV} mode`);
});
