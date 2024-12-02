const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const CuisineModel = require("../models/cuisineModel.js");

const cuisineController = {};

cuisineController.createCuisine = async (req, res, next) => {
  try {
    let { name } = req?.body;
    if (!!req?.files?.image) {
      req.body.image = req?.files?.image[0]?.filename;
    }
    const findCuisine = await CuisineModel.findOne({ name });
    if (findCuisine) {
      throw new CustomError("Cuisine already exists!", 400);
    }
    let cuisineCreated = await CuisineModel.create(req?.body);
    createResponse(cuisineCreated, 200, "Cuisine Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

cuisineController.updateCuisineById = async (req, res) => {
  try {
    const { name, id, status, description, image } = req.body;
    if (!name || !id) {
      throw new CustomError("Required fields are missing to edit cuisine!", 400);
    }
    const existing = await CuisineModel.findOne({
      _id: { $ne: id },
      name: name.trim(),
    });
    if (existing) {
      throw new CustomError("Cuisine already exists!", 400);
    }
    const cuisine = await CuisineModel.findOneAndUpdate(
      { _id: id },
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
    if (!req?.body?.id) {
      throw new CustomError("Required fields are missing to get cuisine!", 400);
    }
    const find = await CuisineModel.findOne({ _id: req?.body?.id });
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
