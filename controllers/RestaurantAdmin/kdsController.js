const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const kdsModel = require("../../models/kdsModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const kdsController = {};

kdsController.createNewKds = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id);

    if (req?.body?.foodCategory && Array.isArray(req?.body?.foodCategory)) {
      req.body.foodCategory = req?.body?.foodCategory.map((categoryId) =>
        convertIdToObjectId(categoryId)
      );
    }

    if (!req?.query?.id) {
      const { name } = req.body;

      const findKds = await kdsModel.findOne({
        name: name,
        isDeleted: false,
        restaurantId: restaurantId
      });

      if (findKds) {
        throw new CustomError("KDS already exists!", 400);
      }

      const createObj = { ...req?.body, restaurantId };
      const newKdsCreated = await kdsModel.create(createObj);

      createResponse(newKdsCreated, 200, "New KDS created successfully.", res);
    } else {
      const { id } = req.query;

      const existingKds = await kdsModel.findOne({
        name: req?.body?.name,
        restaurantId: restaurantId,
        isDeleted: false,
        _id: { $ne: convertIdToObjectId(id) },
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
    console.log("error", error);
    errorHandler(error, req, res);
  }
};

kdsController.getKdsList = async (req, res) => {
  try {
    let { status, limit, page } = req.query;
    let matchObj = { isDeleted: false };
    limit = limit ? Number(limit) : 10;
    page = page ? Number(page) : 1;
    let skip = (page - 1) * limit;
    if (status) {
      matchObj.status = status;
    }
    matchObj.restaurantId = convertIdToObjectId(req.restaurant._id)
    const Cuisines = await kdsModel.aggregate([
      {
        $match: matchObj,
      },
      commonFilter.kdsLookUp,
      {
        $project: {
          ...commonFilter.kdsMasterObj,
          ...commonFilter.kdsMap
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    let result = {
      data: Cuisines,
      pagination: await commonFilter.paginationCalculation(Cuisines, limit, page),
    };
    createResponse(result, 200, "KDS found Successfully.", res);
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
};


kdsController.getKdsById = async (req, res) => {
  try {
    const { id } = req.params;
    const KDS = await kdsModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) },
      },
      commonFilter.kdsLookUp,
      {
        $project: {
          ...commonFilter.kdsMasterObj,
          ...commonFilter.kdsMap
        },
      },
    ]);
    createResponse(
      KDS?.length > 0 ? KDS[0] : [],
      200,
      "KDS found Successfully.",
      res
    );
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
};


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
