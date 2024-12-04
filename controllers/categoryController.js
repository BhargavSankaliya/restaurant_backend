const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const CategoryModel = require("../models/category.js");
const categoryController = {};

categoryController.createCategory = async (req, res, next) => {
  try {
    let { name } = req?.body;
    if (!!req?.files?.cImage) {
      req.body.cImage = req?.files?.cImage[0]?.filename;
    }
    const findCategory = await CategoryModel.findOne({ name });
    if (!!findCategory) {
      if (findCategory?.name === name) {
        throw new CustomError("Category already exists!", 400);
      }
    }
    let categoryCreated = await CategoryModel.create(
      req?.body
    );
    createResponse(categoryCreated, 200, "Category Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res)
  }
}

categoryController.updateCategoryById = async (req, res) => {
  try {
    const { name, id, status, description, cImage } = req.body;
    if (!name || !id) {
      throw new CustomError("Required fields are missing to edit category!", 400);
    }
    const existing = await CategoryModel.findOne({
      _id: { $ne: id },
      $or: [
        { name: name.trim() },
      ]
    })
    if (existing) {
      throw new CustomError("category already exist!", 400);
    }
    const category = await CategoryModel.findOneAndUpdate({ _id: id }, {
      name: name, description: description, status: status, cImage: cImage
    }, { new: true })
    if (!category) {
      throw new CustomError("Category could not be edited!!", 400);
    }
    createResponse(category, 200, "Category Updated Successfully.", res);
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

categoryController.categoryGetById = async (req, res) => {
  try {
    if (!req?.body?.id) {
      throw new CustomError("Required fields are missing to edit category!", 400);
    }
    const find = await CategoryModel.findOne({
      _id: req?.body?.id,
    })
    if (find) {
      createResponse(find, 200, "Category found Successfully.", res);
    } else {
      throw new CustomError("Category not found!", 404);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

categoryController.categoryList = async (req, res) => {
  try {
    const find = await CategoryModel.find({})
    if (find) {
      createResponse(find, 200, "Category found Successfully.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

categoryController.activeCategoryList = async (req, res) => {
  try {
    const find = await CategoryModel.find({ status: "Active" })
    if (find) {
      createResponse(find, 200, "Category found Successfully.", res);
    }
  } catch (error) {
    console.log(error)
    errorHandler(error, req, res)
  }
}

module.exports = { categoryController }
