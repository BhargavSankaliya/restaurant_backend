const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const unitOfSalesModel = require("../models/unitOfSales.js");
const unitofsalesController = {};

unitofsalesController.createUnitOfSales = async (req, res, next) => {
  try {
    const existingUnit = await unitOfSalesModel.findOne({ name: req?.body?.name });
    if (existingUnit) {
      throw new CustomError("Unit of Sales already exists!", 400);
    }
    let unitOfSales = await unitOfSalesModel.create(req?.body);
    createResponse(unitOfSales, 200, "Unit of Sales Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

unitofsalesController.updateUnitOfSalesById = async (req, res) => {
  try {
    const { name, id, status, description } = req.body;
    if (!name || !id) {
      throw new CustomError("Required fields are missing to edit unit of sales!", 400);
    }
    const existing = await unitOfSalesModel.findOne({
      _id: { $ne: id },
      $or: [
        { name: name.trim() },
      ]
    })
    if (existing) {
      throw new CustomError("Unit Of Sales is already exist!", 400);
    }
    const UnitOfSales = await unitOfSalesModel.findOneAndUpdate({ _id: id }, {
      name: name, description: description, status: status
    }, { new: true })
    if (!UnitOfSales) {
      throw new CustomError("Unit Of Sales could not be edited!!", 400);
    }
    createResponse(null, 200, "Unit Of Sales Updated Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

unitofsalesController.UnitOfSalesGetById = async (req, res) => {
  try {
    if (!req?.body?.id) {
      throw new CustomError("Required fields are missing to edit unit of sales!", 400);
    }
    const find = await unitOfSalesModel.findOne({
      _id: new Object(req?.body?.id),
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
    const find = await unitOfSalesModel.find({})
    if (find) {
      createResponse(find, 200, "unit Of Sales found Successfully.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

unitofsalesController.activeUnitOfSalesList = async (req, res) => {
  try {
    const find = await unitOfSalesModel.find({ status: "Active" })
    if (find) {
      createResponse(find, 200, "Unit Of Sales found Successfully.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

module.exports = { unitofsalesController }
