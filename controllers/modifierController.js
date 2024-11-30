const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const ModifierModel = require("../models/modifierModel.js");
const modifierController = {};

modifierController.createNewModifier = async (req, res, next) => {
  try {
    let { additionalItemName, } = req.body;
    const findModifire = await ModifierModel.findOne({ additionalItemName: additionalItemName, isDeleted: false });
    if (!!findModifire) {
      if (findModifire.additionalItemName == additionalItemName) {
        throw new CustomError("Modifire already exists!", 400);
      }
    }
    if (!!req?.files?.modifierImage) {
      req.body.modifierImage = req?.files?.modifierImage[0]?.filename;
    }
    let newRoleCreated = await ModifierModel.create(
      req?.body
    );
    createResponse(newRoleCreated, 200, "New modifire created successfully.", res);
  } catch (error) {
    errorHandler(error, req, res)
  }
}

modifierController.updateModifierById = async (req, res, next) => {
  try {
    let { id, price, description, additionalItemName } = req.body;
    const Modifier = await ModifierModel.findById(id);
    if (!Modifier) {
      throw new CustomError("Modifier not found!", 404);
    }
    const existingModifier = await ModifierModel.findOne({
      additionalItemName: additionalItemName,
      _id: { $ne: id },
    });
    if (existingModifier) {
      throw new CustomError("Additional Item Name already exists!", 400);
    }
    let updateData = {
      price: price,
      description: description,
      additionalItemName: additionalItemName
    }
    if (req?.files) {
      if (req?.files?.modifierImage) {
        updateData.modifierImage = req?.files?.modifierImage[0]?.filename;
      }
    }
    const updatedModifierData = await ModifierModel.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );
    createResponse(updatedModifierData, 200, "Modifier updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

modifierController.getModifierList = async (req, res, next) => {
  try {
    const { status, roleName, searchKeyword } = req?.body;
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
      throw new CustomError("Invalid status. Modifier should be 'Active' or 'Inactive'.", 400);
    }

    if (searchKeyword) {
      const priceValue = parseFloat(searchKeyword);
      queryCondition.$or = [
        { additionalItemName: { $regex: searchKeyword, $options: 'i' } },
        { description: { $regex: searchKeyword, $options: 'i' } },
        ...(isNaN(priceValue)
          ? []
          : [{ price: priceValue }]),
      ];
    }

    const modifiers = await ModifierModel.find(queryCondition).skip(skip).limit(limit);
    const totalModifiers = await ModifierModel.countDocuments(queryCondition);

    const response = {
      totalModifiers,
      totalPages: Math.ceil(totalModifiers / limit),
      currentPage: page,
      modifiers,
    };

    createResponse(response, 200, "Modifiers retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};


modifierController.toggleModifireStatus = async (req, res, next) => {
  try {
    const { status, id } = req?.body;
    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Mofifire 'active' or 'inactive'.", 400);
    }
    const Modifire = await ModifierModel.findById(id);
    if (!Modifire) {
      throw new CustomError("Modifire not found!", 404);
    }
    Modifire.status = status;
    await Modifire.save();
    createResponse(Modifire, 200, "Modifier status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

modifierController.getModifierById = async (req, res, next) => {
  try {
    const { id } = req?.body;
    const Modifier = await ModifierModel.findById(id);
    if (!Modifier) {
      throw new CustomError("Mofifier not found!", 404);
    }
    createResponse(Modifier, 200, "Mofifier retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

modifierController.modifierDelete = async (req, res, next) => {
  try {
    const { id } = req?.body;
    const Modifier = await ModifierModel.findById(id);
    if (!Modifier) {
      throw new CustomError("Modifier not found!", 404);
    }
    Modifier.isDeleted = true;
    await Modifier.save();
    createResponse(Modifier, 200, "Modifier deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { modifierController }
