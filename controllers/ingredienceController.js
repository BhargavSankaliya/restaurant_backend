const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const IngredienceModel = require("../models/ingredience.js");
const ingredienceController = {};

ingredienceController.creatIengredience = async (req, res, next) => {
  try {
    let { name } = req?.body;
    if (!!req?.files?.iImage) {
      req.body.iImage = req?.files?.iImage[0]?.filename;
    }
    const findIngredience = await IngredienceModel.findOne({ name });
    if (!!findIngredience) {
      if (findIngredience.name === name) {
        throw new CustomError("Ingredience already exists!", 400);
      }
    }
    let ingredienceCreated = await IngredienceModel.create(
      req?.body
    );
    createResponse(ingredienceCreated, 200, "Ingredience created successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

ingredienceController.updateIngredienceById = async (req, res) => {
  try {
    const { name, id, status, description, iImage } = req.body;
    if (!name || !id) {
      throw new CustomError("Required fields are missing to edit Ingredience!", 400);
    }
    const existing = await IngredienceModel.findOne({
      _id: { $ne: id },
      $or: [
        { name: name.trim() },
      ]
    })
    if (existing) {
      throw new CustomError("Ingredience already exist!", 400);
    }
    const ingredience = await IngredienceModel.findOneAndUpdate({ _id: id }, {
      name: name, description: description, status: status, iImage: iImage
    }, { new: true })
    if (!ingredience) {
      throw new CustomError("Ingredience could not be edited!!", 400);
    }
    createResponse(null, 200, "Ingredience Updated Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

ingredienceController.ingredienceGetById = async (req, res) => {
  try {
    if (!req?.body?.id) {
      throw new CustomError("Required fields are missing to edit Ingredience!", 400);
    }
    const find = await IngredienceModel.findOne({
      _id: req?.body?.id,
    })
    if (find) {
      createResponse(find, 200, "Ingredience found Successfully.", res);
    } else {
      throw new CustomError("Ingredience not found!", 404);
    }
  } catch (error) {
    errorHandler(error, req, res)
  }
}

ingredienceController.IngredienceList = async (req, res) => {
  try {
    const find = await IngredienceModel.find({})
    if (find) {
      createResponse(find, 200, "Ingredience found Successfully.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

ingredienceController.activeIngredienceList = async (req, res) => {
  try {
    const find = await IngredienceModel.find({ status: "Active" })
    if (find) {
      createResponse(find, 200, " ingredience found Successfully.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

module.exports = { ingredienceController }
