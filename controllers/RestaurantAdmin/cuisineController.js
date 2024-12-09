const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const CuisineModel = require("../../models/cuisineModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const cuisineController = {};

cuisineController.createCuisine = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name } = req?.body;
      const findCuisine = await CuisineModel.findOne({ name, restaurantId });
      if (findCuisine) {
        throw new CustomError("Cuisine already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let cuisineCreated = await CuisineModel.create(createObj);
      createResponse(cuisineCreated, 200, "Cuisine Created Successfully.", res);
    } else {
      const { id } = req?.query;
      const existing = await CuisineModel.findOne({
        _id: { $ne: convertIdToObjectId(id) },
        restaurantId: restaurantId,
        name: req?.body?.name.trim(),
      });
      if (existing) {
        throw new CustomError("Cuisine already exists!", 400);
      }
      const cuisine = await CuisineModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!cuisine) {
        throw new CustomError("Cuisine could not be edited!", 400);
      }
      createResponse(cuisine, 200, "Cuisine Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

cuisineController.cuisineGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Cuisines = await CuisineModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.cuisinesMasterObj
      }
    ]);
    createResponse(Cuisines?.length > 0 ? Cuisines[0] : [], 200, "Cuisines found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

cuisineController.cuisineList = async (req, res) => {
  try {
    let { status, limit, page } = req?.query;
    let matchObj = {}
    matchObj.isDeleted = false
    if (!limit) {
      limit = 10
    }
    if (!page) {
      page = 1
    }
    let skip = (Number(page) - 1) * Number(limit)
    if (status) {
      matchObj.status = status
    }
    const Cuisines = await CuisineModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.cuisinesMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Cuisines,
      pagination: await commonFilter.paginationCalculation(Cuisines, limit, page)
    }
    createResponse(result, 200, "Cuisines found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

cuisineController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Cuisine = await CuisineModel.findById(id)
    if (!Cuisine) {
      throw new CustomError("Cuisines not found", 404);
    }
    await CuisineModel.findByIdAndUpdate(id, { $set: { status: Cuisine.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Cuisines status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

cuisineController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let CuisineCheck = await CuisineModel.findById(id)
    if (!CuisineCheck) {
      throw new CustomError("Cuisines not found", 404);
    }
    await CuisineModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Cuisines deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

module.exports = { cuisineController };
