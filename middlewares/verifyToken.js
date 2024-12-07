const jwt = require("jsonwebtoken");
const { CustomError, errorHandler } = require("../middlewares/error");
const config = require("../environmentVariable.json");
const MasterUserModel = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  try {

    let token = req.headers["authorization"];
    if (!token || !token.startsWith("Bearer ")) {
      throw new CustomError("No token provided", 401);
    }

    token = token.split("Bearer ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      throw new CustomError("Invalid token", 401);
    }
    const storeId = decoded._id;
    const store = await MasterUserModel.findOne({
      _id: storeId,
    });

    // if (store.jwtToken !== token) {
    //   throw new CustomError("Unauthorized! Token mismatch", 401);
    // }

    if (!store) {
      throw new CustomError("Invalid or expired token!", 400);
    }

    if (store.status == 'Inactive') {
      throw new CustomError("Store is inactivated!", 401);
    }

    req.store = store;
    next();
  } catch (error) {
    errorHandler(error, req, res)
  }
};

module.exports = verifyToken;
