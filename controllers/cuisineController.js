const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const CuisineModel = require("../models/cuisineModel.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const categoryController = {};


const cuisineController = {};

cuisineController.createCuisine = async (req, res, next) => {
  try {
    let { name, description, image, status } = req.body;
console.log(req)
    if (!!req.files.image) {
      req.body.image = req.files.image[0].filename; // Assuming you're using multer for file uploads
    }

    const findCuisine = await CuisineModel.findOne({ name });

    if (findCuisine) {
      throw new CustomError("Cuisine already exists!", 400);
    }

    let cuisineCreated = await CuisineModel.create(req.body);
    createResponse(cuisineCreated, 200, "Cuisine Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

cuisineController.updateCuisineById = async (req, res) => {
  try {
    const { name, cuisineId, status, description, image } = req.body;
    
    if (!name || !cuisineId) {
      throw new CustomError("Required fields are missing to edit cuisine!", 400);
    }

    const existing = await CuisineModel.findOne({
      _id: { $ne: cuisineId },
      name: name.trim(),
    });

    if (existing) {
      throw new CustomError("Cuisine already exists!", 400);
    }

    const cuisine = await CuisineModel.findOneAndUpdate(
      { _id: cuisineId },
      { name, description, status, image },
      { new: true }
    );

    if (!cuisine) {
      throw new CustomError("Cuisine could not be edited!", 400);
    }

    createResponse(cuisine, 200, "Cuisine Updated Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

cuisineController.cuisineGetById = async (req, res) => {
  try {
    if (!req.params.cuisineId) {
      throw new CustomError("Required fields are missing to get cuisine!", 400);
    }

    const find = await CuisineModel.findOne({ _id: req.params.cuisineId });

    if (find) {
      createResponse(find, 200, "Cuisine found successfully.", res);
    } else {
      throw new CustomError("Cuisine not found!", 404);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

cuisineController.cuisineList = async (req, res) => {
  try {
    const find = await CuisineModel.find({});
    createResponse(find, 200, "Cuisines retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

cuisineController.activeCuisineList = async (req, res) => {
  try {
    const find = await CuisineModel.find({ status: "Active" });
    createResponse(find, 200, "Active cuisines retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { cuisineController };
