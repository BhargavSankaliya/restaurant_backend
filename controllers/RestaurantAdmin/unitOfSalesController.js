const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const unitOfSalesModel = require("../../models/unitOfSales.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const unitofsalesController = {};

unitofsalesController.createUnitOfSales = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      const existingUnit = await unitOfSalesModel.findOne({ name: req?.body?.name, restaurantId: restaurantId, isDeleted: false });
      if (existingUnit) {
        throw new CustomError("Unit of Sales already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let unitOfSales = await unitOfSalesModel.create(createObj);
      createResponse(unitOfSales, 200, "Unit of Sales Created Successfully.", res);
    } else {
      const { id } = req.query;
      const existing = await unitOfSalesModel.findOne({
        _id: { $ne: id },
        restaurantId: restaurantId,
        $or: [
          { name: req?.body?.name?.trim() },
        ]
      })
      if (existing) {
        throw new CustomError("Unit Of Sales is already exist!", 400);
      }
      const UnitOfSales = await unitOfSalesModel.findOneAndUpdate({ _id: id }, req?.body, { new: true })
      if (!UnitOfSales) {
        throw new CustomError("Unit Of Sales could not be edited!!", 400);
      }
      createResponse(UnitOfSales, 200, "Unit Of Sales Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

unitofsalesController.UnitOfSalesGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id) {
      throw new CustomError("Required fields are missing to edit unit of sales!", 400);
    }
    const find = await unitOfSalesModel.findOne({
      _id: new Object(id),
    })
    if (find) {
      createResponse(find, 200, "unit Of Sales found Successfully.", res);
    } else {
      createResponse(null, 404, "unit Of Sales not found.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

unitofsalesController.unitOfSalesList = async (req, res) => {
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
    const restaurant = await unitOfSalesModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.unitOfSalesMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: restaurant,
      pagination: await commonFilter.paginationCalculation(restaurant, limit, page)
    }
    createResponse(result, 200, "unit Of Sales found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

unitofsalesController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req.params.id)
    let unitOfSales = await unitOfSalesModel.findById(id)
    if (!unitOfSales) {
      throw new CustomError("unit Of Sales not found", 404);
    }
    await unitOfSalesModel.findByIdAndUpdate(id, { $set: { status: unitOfSales.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "unit Of Sales status updated successfully.", res);

  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

unitofsalesController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req.params.id)
    let restaurantCheck = await unitOfSalesModel.findById(id)
    if (!restaurantCheck) {
      throw new CustomError("unit Of Sales not found", 404);
    }
    await unitOfSalesModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "unit Of Sales deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { unitofsalesController }
