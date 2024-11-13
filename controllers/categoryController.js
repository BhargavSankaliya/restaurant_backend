const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const CategoryModel = require("../models/category.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const categoryController = {};

categoryController.createCategory = async (req, res, next) => {
    console.log("herrererer")
  try {

   let { name, description, cImage, status } = req.body;


    if (!!req.files.cImage) {
      req.body.cImage = req.files.cImage[0].filename;
  }

    const findCategory = await CategoryModel.findOne({ name});

    if (!!findCategory) {
      if (findCategory.name === name) {
        throw new CustomError("Category already exists!", 400);
      }
    }

   

    let categoryCreated = await CategoryModel.create(
      req.body
    );

    createResponse(null, 200, "Category Created Successfully.", categoryCreated);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}
categoryController.updateCategoryById = async (req, res) => {
  try {

    const { name, categoryId,status , description , cImage} = req.body;
    if (!name || !categoryId) {
      throw new CustomError("Required fields are missing to edit category!", 400);
    }

    const existing = await CategoryModel.findOne({
      _id: { $ne: categoryId },
      $or: [
        { name: name.trim() },
      ]
    })

    if (existing) {
      throw new CustomError("category already exist!", 400);
    }

    const category = await CategoryModel.findOneAndUpdate({ _id: categoryId }, {
      name : name, description: description, status : status , cImage: cImage
    }, { new: true })
    if (!category) { //|| !user.modifiedCount || !user.matchedCount
      throw new CustomError("Category could not be edited!!", 400);
    }
    // console.log(user.sessionId);
    createResponse(null, 200, "Category Updated Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

categoryController.categoryGetById = async (req, res) => {
  try {

   // const {categoryId} = req.params;
    if (!req.params.categoryId) {
      throw new CustomError("Required fields are missing to edit category!", 400);
    }

    const find = await CategoryModel.findOne({
      _id: new Object(req.params.categoryId),
    })

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "Category found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

categoryController.categoryList = async (req, res) => {
  try {

   // const {categoryId} = req.params;
   
    const find = await CategoryModel.find({})

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "Category found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

categoryController.activeCategoryList = async (req, res) => {
  try {

   // const {categoryId} = req.params;
   
    const find = await CategoryModel.find({status :"Active"})

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "Category found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}
module.exports = { categoryController }
