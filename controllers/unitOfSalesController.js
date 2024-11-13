const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const unitOfSalesModel = require("../models/unitOfSales.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const unitofsalesController = {};

unitofsalesController.createUnitOfSales = async (req, res, next) => {
    console.log("herrererer")
  try {

   let { name, description, status } = req.body;

    let unitOfSales = await unitOfSalesModel.create(
      req.body
    );

    createResponse(unitOfSales, 200, "Unit of sales Created Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}
unitofsalesController.updateUnitOfSalesById = async (req, res) => {
  try {

    const { name, UnitOfSalesId, status , description} = req.body;
    if (!name || !UnitOfSalesId) {
      throw new CustomError("Required fields are missing to edit unit of sales!", 400);
    }

    const existing = await unitOfSalesModel.findOne({
      _id: { $ne: UnitOfSalesId },
      $or: [
        { name: name.trim() },
      ]
    })

    if (existing) {
      throw new CustomError("data is already exist!", 400);
    }

    const UnitOfSales = await unitOfSalesModel.findOneAndUpdate({ _id: UnitOfSalesId }, {
      name : name, description: description, status : status 
    }, { new: true })
    if (!UnitOfSales) { //|| !user.modifiedCount || !user.matchedCount
      throw new CustomError("Unit Of Sales could not be edited!!", 400);
    }
    // console.log(user.sessionId);
    createResponse(null, 200, "Unit Of Sales Updated Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

unitofsalesController.UnitOfSalesGetById = async (req, res) => {
  try {
console.log(req.params)
   // const {categoryId} = req.params;
    if (!req.params.UnitOfSalesId) {
      throw new CustomError("Required fields are missing to edit unit of sales!", 400);
    }

    const find = await unitOfSalesModel.findOne({
      _id: new Object(req.params.UnitOfSalesId),
    })
    console.log("findd",find)



    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "unit Of Sales found Successfully.", res);
    }else
    {
      createResponse(null, 404, "unit Of Sales not found.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

unitofsalesController.unitOfSalesList = async (req, res) => {
  try {

   // const {categoryId} = req.params;
   
    const find = await unitOfSalesModel.find({})

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "unit Of Sales found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

unitofsalesController.activeUnitOfSalesList = async (req, res) => {
  try {

   // const {categoryId} = req.params;
   
    const find = await unitOfSalesModel.find({status :"Active"})

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "Unit Of Sales found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}
module.exports = { unitofsalesController }
