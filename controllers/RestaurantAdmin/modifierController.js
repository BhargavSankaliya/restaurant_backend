const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ModifierModel = require("../../models/modifierModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const modifierController = {};

modifierController.createNewModifier = async (req, res, next) => {
  try {
    if (!req?.query?.id) {
      let { additionalItemName, } = req.body;
      const findModifire = await ModifierModel.findOne({ additionalItemName: additionalItemName, isDeleted: false });
      if (!!findModifire) {
        if (findModifire.additionalItemName == additionalItemName) {
          throw new CustomError("Modifire already exists!", 400);
        }
      }
      let newRoleCreated = await ModifierModel.create(
        req?.body
      );
      createResponse(newRoleCreated, 200, "New modifire created successfully.", res);
    } else {
      const { id } = req?.query;
      const existingModifier = await ModifierModel.findOne({
        additionalItemName: req?.body?.additionalItemName,
        _id: { $ne: id },
      });
      if (existingModifier) {
        throw new CustomError("Additional Item Name already exists!", 400);
      }
      const updatedModifierData = await ModifierModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      createResponse(updatedModifierData, 200, "Modifier updated successfully.", res);
    }
  } catch (error) {
    console.log("error", error)
    errorHandler(error, req, res)
  }
}

modifierController.getModifierList = async (req, res) => {
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
    const Cuisines = await ModifierModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.modifierMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Cuisines,
      pagination: await commonFilter.paginationCalculation(Cuisines, limit, page)
    }
    createResponse(result, 200, "Modifier found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

modifierController.getModifierById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Modifier = await ModifierModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.modifierMasterObj
      }
    ]);
    createResponse(Modifier?.length > 0 ? Modifier[0] : [], 200, "Modifier found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

modifierController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Cuisine = await ModifierModel.findById(id)
    if (!Cuisine) {
      throw new CustomError("Modifier not found", 404);
    }
    await ModifierModel.findByIdAndUpdate(id, { $set: { status: Cuisine.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Modifier status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

modifierController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let CuisineCheck = await ModifierModel.findById(id)
    if (!CuisineCheck) {
      throw new CustomError("Modifier not found", 404);
    }
    await ModifierModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Modifier deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

module.exports = { modifierController }
