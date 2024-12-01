const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const ItemsModel = require("../models/itemsModel.js");
const itemsController = {};

itemsController.createNewItem = async (req, res, next) => {
  try {
    let { itemName, } = req.body;
    const findItems = await ItemsModel.findOne({ itemName: itemName, isDeleted: false });
    if (!!findItems) {
      if (findItems.itemName == itemName) {
        throw new CustomError("Item already exists!", 400);
      }
    }
    if (!!req?.files?.itemImage) {
      req.body.itemImage = req?.files?.itemImage[0]?.filename;
    }
    let newRoleCreated = await ItemsModel.create(
      req?.body
    );
    createResponse(newRoleCreated, 200, "New modifire created successfully.", res);
  } catch (error) {
    errorHandler(error, req, res)
  }
}

itemsController.updateItemById = async (req, res, next) => {
  try {
    let { id, price, description, itemName } = req.body;
    const Modifier = await ItemsModel.findById(id);
    if (!Modifier) {
      throw new CustomError("Modifier not found!", 404);
    }
    const existingModifier = await ItemsModel.findOne({
      itemName: itemName,
      _id: { $ne: id },
    });
    if (existingModifier) {
      throw new CustomError("Additional Item Name already exists!", 400);
    }
    let updateData = {
      price: price,
      description: description,
      itemName: itemName
    }
    if (req?.files) {
      if (req?.files?.itemImage) {
        updateData.itemImage = req?.files?.itemImage[0]?.filename;
      }
    }
    const updatedItemsData = await ItemsModel.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );
    createResponse(updatedItemsData, 200, "Item updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

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
