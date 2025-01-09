const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const stockManagementModel = require("../../models/stockManagementModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const stockManagementController = {};

stockManagementController.createStock = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!!req?.body?.category) {
      req.body.category = convertIdToObjectId(req?.body?.category)
    }
    restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let createObj = { ...req.body, restaurantId }
      let stockCreated = await stockManagementModel.create(createObj);
      createResponse(stockCreated, 200, "Stock Created Successfully.", res);
    } else {
      const { id } = req?.query;
      if (!!req?.body?.category) {
        req.body.category = convertIdToObjectId(req?.body?.category)
      }
      const Stock = await stockManagementModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!Stock) {
        throw new CustomError("Stock could not be edited!", 400);
      }
      createResponse(Stock, 200, "Stock Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

stockManagementController.stockGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Stock = await stockManagementModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
          pipeline: [
            {
              $project: {
                name: 1,
                image: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: { ...commonFilter.restaurantStockManagementObj, categoryDetails: 1 }
      }
    ]);
    createResponse(Stock?.length > 0 ? Stock[0] : [], 200, "Stock found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

stockManagementController.stockList = async (req, res) => {
  try {
    let { status, limit, page } = req?.query;
    let matchObj = {}
    matchObj.isDeleted = false
    matchObj.restaurantId = convertIdToObjectId(req.restaurant._id)
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
    const Stock = await stockManagementModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.restaurantStockManagementObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Stock,
      pagination: await commonFilter.paginationCalculation(Stock, limit, page)
    }
    createResponse(result, 200, "Stock found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

stockManagementController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Stock = await stockManagementModel.findById(id)
    if (!Stock) {
      throw new CustomError("Stock not found", 404);
    }
    await stockManagementModel.findByIdAndUpdate(id, { $set: { status: Stock.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Stock status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

stockManagementController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let StockCheck = await stockManagementModel.findById(id)
    if (!StockCheck) {
      throw new CustomError("Stock not found", 404);
    }
    await stockManagementModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Stock deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


stockManagementController.dropDown = async (req, res) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await stockManagementModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { stockManagementController };
