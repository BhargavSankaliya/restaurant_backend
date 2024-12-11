const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ItemsModel = require("../../models/itemsModel.js");
const CategoryModel = require("../../models/categoryModel.js");
const IngredientModel = require("../../models/ingredience.js");
const itemsController = {};
const { commonFilter, convertIdToObjectId } = require("../../middlewares/commonFilter.js")


itemsController.createUpdate = async (req, res, next) => {
  try {
    let { name, description, image, price, spiceLevel, categoryId, ingredientId, choices, options } = req.body;
    let restaurantId = convertIdToObjectId(req.restaurant._id)

    if (req?.query?.itemId) {
      const findItems = await ItemsModel.findOne({ _id: { $ne: convertIdToObjectId(req.query.itemId) }, name: name, restaurantId: restaurantId, isDeleted: false });
      if (findItems) {
        throw new CustomError("Item already exists!", 400);
      }
      let categoryCheck = await CategoryModel.findOne({ _id: convertIdToObjectId(categoryId), isDeleted: false, restaurantId: restaurantId })
      if (!categoryCheck) {
        throw new CustomError("Please enter valid category", 400);
      }
      let ingredientCheck = await IngredientModel.findOne({ _id: convertIdToObjectId(ingredientId), isDeleted: false, restaurantId: restaurantId })
      if (!ingredientCheck) {
        throw new CustomError("Please enter valid ingredient", 400);
      }
      let result = await ItemsModel.findByIdAndUpdate(convertIdToObjectId(req?.query?.itemId), { $set: req.body })
      createResponse(result, 200, "Item updated successfully.", res);
    } else {
      const findItems = await ItemsModel.findOne({ name: name, restaurantId: restaurantId, isDeleted: false });
      if (findItems) {
        throw new CustomError("Item already exists!", 400);
      }
      let categoryCheck = await CategoryModel.findOne({ _id: convertIdToObjectId(categoryId), isDeleted: false, restaurantId: restaurantId })
      if (!categoryCheck) {
        throw new CustomError("Please enter valid category", 400);
      }
      let ingredientCheck = await IngredientModel.findOne({ _id: convertIdToObjectId(ingredientId), isDeleted: false, restaurantId: restaurantId })
      if (!ingredientCheck) {
        throw new CustomError("Please enter valid ingredient", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let result = await ItemsModel(createObj).save()

      createResponse(result, 200, "Item created successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res)
  }
}


itemsController.list = async (req, res, next) => {
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
    const data = await ItemsModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData"
        }
      },
      {
        $unwind: "$categoryData"
      },
      {
        $project: commonFilter.itemObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: data,
      pagination: await commonFilter.paginationCalculation(data, limit, page)
    }
    createResponse(result, 200, "Category found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
};

itemsController.toggleStatus = async (req, res, next) => {
  try {
    let itemId = convertIdToObjectId(req.params.id)
    const Item = await ItemsModel.findById(itemId);
    if (!Item) {
      throw new CustomError("Item not found!", 404);
    }
    await ItemsModel.updateOne({ _id: itemId }, { $set: { status: Item.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Item status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

itemsController.getItemById = async (req, res, next) => {
  try {
    let itemId = convertIdToObjectId(req.params.id)
    const Item = await ItemsModel.findOne({ _id: itemId }, { _id: 1, name: 1, description: 1, image: 1, price: 1, spiceLevel: 1, status: 1, categoryId: 1, ingredientId: 1, options: 1, choices: 1, createdAt: 1 });
    if (!Item) {
      throw new CustomError("Item not found!", 404);
    }
    createResponse(Item, 200, "Item retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

itemsController.delete = async (req, res, next) => {
  try {
    let itemId = convertIdToObjectId(req.params.id)
    const Item = await ItemsModel.findById(itemId);
    if (!Item) {
      throw new CustomError("Item not found!", 404);
    }
    await ItemsModel.findByIdAndUpdate(itemId, { $set: { isDeleted: true } })
    createResponse({}, 200, "Item deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { itemsController }
