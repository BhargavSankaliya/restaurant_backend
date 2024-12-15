const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const stockHistoryModel = require("../../models/stockHistoryModel.js");
const stockManagementModel = require("../../models/stockManagementModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const stockHistoryController = {};

stockHistoryController.createStockHistory = async (req, res, next) => {
  try {
    if (!req?.body?.stockId || req?.body?.stockId.trim() === "") {
      throw new CustomError("Please Pass stockId", 404);
    }

    let StockMangementData = await stockManagementModel.findById(req?.body?.stockId);
    if (!StockMangementData) {
      throw new CustomError("Please Pass Valid StockId", 404);
    }

    let restaurantId = convertIdToObjectId(StockMangementData?.restaurantId);
    req.body.stockId = convertIdToObjectId(req?.body?.stockId)

    if (!!req?.restaurant?._id) {
      req.body.performedBy = convertIdToObjectId(req?.restaurant?._id)
    } else if (!!req?.cashier?._id) {
      rqe.body.performedBy = convertIdToObjectId(rqe?.cashier?._id)
    }

    if (!req?.query?.id) {
      let createObj = { ...req.body, restaurantId };
      let StockHistoryCreated = await stockHistoryModel.create(createObj);
      createResponse(StockHistoryCreated, 200, "Stock History Created Successfully.", res);
    } else {
      const { id } = req?.query;

      if (req?.body?.category) {
        req.body.category = convertIdToObjectId(req?.body?.category);
      }

      const StockHistory = await stockHistoryModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );

      if (!StockHistory) {
        throw new CustomError("Stock History could not be edited!", 400);
      }
      createResponse(StockHistory, 200, "Stock History Updated Successfully.", res);
    }
  } catch (error) {
    console.log("error", error);
    errorHandler(error, req, res);
  }
};


stockHistoryController.stockHistoryGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const StockHistory = await stockHistoryModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.restaurantHistoryObj
      }
    ]);
    createResponse(StockHistory?.length > 0 ? StockHistory[0] : [], 200, "Stock History found Successfully.", res);
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
}

stockHistoryController.stockHistoryList = async (req, res) => {
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
    const StockHistory = await stockHistoryModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.restaurantHistoryObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: StockHistory,
      pagination: await commonFilter.paginationCalculation(StockHistory, limit, page)
    }
    createResponse(result, 200, "Stock History found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

stockHistoryController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let StockHistory = await stockHistoryModel.findById(id)
    if (!StockHistory) {
      throw new CustomError("Stock History not found", 404);
    }
    await stockHistoryModel.findByIdAndUpdate(id, { $set: { status: StockHistory.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Stock History status updated successfully.", res);

  } catch (error) {
    console.log("error", error)
    errorHandler(error, req, res);
  }
}

stockHistoryController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let StockHistoryCheck = await stockHistoryModel.findById(id)
    if (!StockHistoryCheck) {
      throw new CustomError("Stock History not found", 404);
    }
    await stockHistoryModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Stock History deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


stockHistoryController.dropDown = async (req, res) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await stockHistoryModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { stockHistoryController };
