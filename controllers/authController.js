const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const UserModel = require("../models/userModel.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const authController = {};

authController.createUpdateStore = async (req, res, next) => {
  try {

    let { name, logo, address, description, email, phone, password, gstNumber, instagramUrl, facebookUrl, youtubeUrl, twitterUrl, locations, jobTitle, businessType, theme, color, companyName, companyWebsite } = req.body;



    if (req.query._id) {
      const storeId = convertIdToObjectId(req.query._id);
      let StoreUpdate = await UserModel.findOneAndUpdate({ _id: storeId }, req.body, { upsert: true })
      return createResponse(null, 200, "Store Updated Successfully.", res);
    }

    const findStore = await UserModel.findOne({ email, isDeleted: false });

    if (!!findStore) {
      if (findStore.email === email) {
        throw new CustomError("Email already exists!", 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    let storeData = req.body;
    storeData.password = hashedPassword

    let storeCreated = await UserModel.create(
      storeData
    );

    createResponse(null, 200, "Store Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res)
  }
}
module.exports = { authController }
