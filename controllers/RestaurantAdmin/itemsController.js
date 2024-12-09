const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ItemsModel = require("../../models/itemsModel.js");
const CategoryModel = require("../../models/category.js");
const IngredientModel = require("../../models/ingredience.js");
const itemsController = {};
const commonFilter = require("../../middlewares/commonFilter.js")

itemsController.createUpdate = async (req, res, next) => {
  try {
    let { name, description, image, price, spiceLevel, categoryId, ingredientId, choices, options } = req.body;
    let restaurantId = commonFilter.convertIdToObjectId(req.restaurant._id)

    if (req?.query?.itemId) {
      const findItems = await ItemsModel.findOne({ _id: { $ne: commonFilter.convertIdToObjectId(req.query.itemId) }, name: name, restaurantId: restaurantId, isDeleted: false });
      if (findItems) {
        throw new CustomError("Item already exists!", 400);
      }
      let categoryCheck = await CategoryModel.findOne({ _id: commonFilter.convertIdToObjectId(categoryId), isDeleted: false, restaurantId: restaurantId })
      if (!categoryCheck) {
        throw new CustomError("Please enter valid category", 400);
      }
      let ingredientCheck = await IngredientModel.findOne({ _id: commonFilter.convertIdToObjectId(categoryId), isDeleted: false, restaurantId: restaurantId })
      if (!ingredientCheck) {
        throw new CustomError("Please enter valid ingredient", 400);
      }
      let result = await ItemsModel.findByIdAndUpdate(commonFilter.convertIdToObjectId(req?.query?.itemId), { $set: req.body })
      createResponse(result, 200, "Item updated successfully.", res);
    } else {
      const findItems = await ItemsModel.findOne({ name: name, restaurantId: restaurantId, isDeleted: false });
      if (findItems) {
        throw new CustomError("Item already exists!", 400);
      }
      let categoryCheck = await CategoryModel.findOne({ _id: commonFilter.convertIdToObjectId(categoryId), isDeleted: false, restaurantId: restaurantId })
      if (!categoryCheck) {
        throw new CustomError("Please enter valid category", 400);
      }
      let ingredientCheck = await IngredientModel.findOne({ _id: commonFilter.convertIdToObjectId(categoryId), isDeleted: false, restaurantId: restaurantId })
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

itemsController.getItemList = async (req, res, next) => {
  try {
    const { status } = req?.body;
    const page = parseInt(req?.body?.page) || 1;
    const limit = parseInt(req?.body?.limit) || 10;
    const skip = (page - 1) * limit;

    let queryCondition = {
      isDeleted: false,
    };

    if (status === 'Active') {
      queryCondition.status = 'Active';
    } else if (status === 'Inactive') {
      queryCondition.status = 'Inactive';
    } else if (status) {
      throw new CustomError("Invalid status. Items should be 'Active' or 'Inactive'.", 400);
    }

    const items = await ItemsModel.find(queryCondition).skip(skip).limit(limit);
    const totalItems = await ItemsModel.countDocuments(queryCondition);

    const response = {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      items,
    };

    createResponse(response, 200, "Items retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

itemsController.toggleItemStatus = async (req, res, next) => {
  try {
    const { status, id } = req?.body;
    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Item 'active' or 'inactive'.", 400);
    }
    const Item = await ItemsModel.findById(id);
    if (!Item) {
      throw new CustomError("Item not found!", 404);
    }
    Item.status = status;
    await Item.save();
    createResponse(Item, 200, "Item status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

itemsController.getItemById = async (req, res, next) => {
  try {
    const { id } = req?.body;
    const Item = await ItemsModel.findById(id);
    if (!Item) {
      throw new CustomError("Item not found!", 404);
    }
    createResponse(Item, 200, "Item retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

itemsController.itemDelete = async (req, res, next) => {
  try {
    const { id } = req?.body;
    const Item = await ItemsModel.findById(id);
    if (!Item) {
      throw new CustomError("Item not found!", 404);
    }
    Item.isDeleted = true;
    await Item.save();
    createResponse(Item, 200, "Item deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { itemsController }
