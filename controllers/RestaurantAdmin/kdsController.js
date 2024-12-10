const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const kdsModel = require("../../models/kdsModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const kdsController = {};

kdsController.createNewKds = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name, } = req.body;
      const findKds = await kdsModel.findOne({ name: name, isDeleted: false, restaurantId: restaurantId });
      if (findKds) {
        throw new CustomError("KDS already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let newKdsCreated = await kdsModel.create(
        createObj
      );
      createResponse(newKdsCreated, 200, "New KDS created successfully.", res);
    } else {
      const { id } = req?.query;
      const existingKds = await kdsModel.findOne({
        name: req?.body?.name,
        restaurantId: restaurantId,
        _id: { $ne: id },
      });
      if (existingKds) {
        throw new CustomError("KDS already exists!", 400);
      }
      const updatedKdsData = await kdsModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      createResponse(updatedKdsData, 200, "KDS updated successfully.", res);
    }
  } catch (error) {
    console.log("error", error)
    errorHandler(error, req, res)
  }
}

kdsController.getKdsList = async (req, res) => {
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
    const Cuisines = await kdsModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.modifierMasterObj
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
    createResponse(result, 200, "KDS found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

kdsController.getKdsById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Modifier = await kdsModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.modifierMasterObj
      }
    ]);
    createResponse(Modifier?.length > 0 ? Modifier[0] : [], 200, "KDS found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

kdsController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Cuisine = await kdsModel.findById(id)
    if (!Cuisine) {
      throw new CustomError("KDS not found", 404);
    }
    await kdsModel.findByIdAndUpdate(id, { $set: { status: Cuisine.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "KDS status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

kdsController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let CuisineCheck = await kdsModel.findById(id)
    if (!CuisineCheck) {
      throw new CustomError("KDS not found", 404);
    }
    await kdsModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "KDS deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

module.exports = { kdsController }
