const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const IngredienceModel = require("../models/ingredience.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const ingredienceController = {};

ingredienceController.creatIengredience = async (req, res, next) => {
    console.log("herrererer")
  try {

   let { name, description, iImage, status, isVeg , isVegen , isJain, isNonVeg} = req.body;


    if (!!req.files.iImage) {
      req.body.iImage = req.files.iImage[0].filename;
  }

    const findIngredience = await IngredienceModel.findOne({ name});

    if (!!findIngredience) {
      if (findIngredience.name === name) {
        throw new CustomError("Ingredience already exists!", 400);
      }
    }

   

    let ingredienceCreated = await IngredienceModel.create(
      req.body
    );
    console.log("ingredienceCreatedingredienceCreated",ingredienceCreated)

    createResponse(null, 200, "Ingredience Created Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}
ingredienceController.updateIngredienceById = async (req, res) => {
  try {

    const { name, ingredienceId,status , description , iImage ,  isVeg , isVegen , isJain, isNonVeg} = req.body;
    if (!name || !ingredienceId) {
      throw new CustomError("Required fields are missing to edit Ingredience!", 400);
    }

    const existing = await IngredienceModel.findOne({
      _id: { $ne: ingredienceId },
      $or: [
        { name: name.trim() },
      ]
    })

    if (existing) {
      throw new CustomError("Ingredience already exist!", 400);
    }

    const ingredience = await IngredienceModel.findOneAndUpdate({ _id: ingredienceId }, {
      name : name, description: description, status : status , iImage: iImage
    }, { new: true })
    if (!ingredience) { //|| !user.modifiedCount || !user.matchedCount
      throw new CustomError("Ingredience could not be edited!!", 400);
    }
    // console.log(user.sessionId);
    createResponse(null, 200, "Ingredience Updated Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

ingredienceController.ingredienceGetById = async (req, res) => {
  try {

   // const {categoryId} = req.params;
    if (!req.params.ingredienceId) {
      throw new CustomError("Required fields are missing to edit Ingredience!", 400);
    }

    const find = await IngredienceModel.findOne({
      _id: new Object(req.params.ingredienceId),
    })

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "Ingredience found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

ingredienceController.IngredienceList = async (req, res) => {
  try {

   // const {categoryId} = req.params;
   
    const find = await IngredienceModel.find({})

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, "Ingredience found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

ingredienceController.activeIngredienceList = async (req, res) => {
  try {

   // const {categoryId} = req.params;
   
    const find = await IngredienceModel.find({status :"Active"})

    console.log(find)


    if (find) { //|| !user.modifiedCount || !user.matchedCount
      createResponse(find, 200, " ingredience found Successfully.", res);
    }
    // console.log(user.sessionId);
    
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}
module.exports = { ingredienceController }
