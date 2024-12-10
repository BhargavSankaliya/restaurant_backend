const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const IngredienceModel = require("../../models/ingredience.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const ingredienceController = {};

ingredienceController.creatIengredience = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name } = req?.body;
      const findIngredience = await IngredienceModel.findOne({ name, restaurantId ,isDeleted: false});
      if (findIngredience) {
        throw new CustomError("Ingredience already exists!", 400);
      }
      let createObj={...req.body,restaurantId}
      let ingredienceCreated = await IngredienceModel.create(
        createObj
      );
      createResponse(ingredienceCreated, 200, "Ingredience created successfully.", res);
    } else {
      const { id } = req?.query
      const existing = await IngredienceModel.findOne({
        _id: { $ne: id },
        restaurantId:restaurantId,
        isDeleted: false,
        $or: [
          { name: req?.body?.name?.trim() },
        ]
      })
      if (existing) {
        throw new CustomError("Ingredience already exist!", 400);
      }
      const ingredience = await IngredienceModel.findOneAndUpdate({ _id: id }, req?.body, { new: true })
      if (!ingredience) {
        throw new CustomError("Ingredience could not be edited!!", 400);
      }
      createResponse(null, 200, "Ingredience Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res)
  }
}

ingredienceController.ingredienceGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    let matchObj = { _id: convertIdToObjectId(id) }
    const Ingredience = await IngredienceModel.aggregate([
      {
        $match: matchObj
      },
      {
        $project: commonFilter.ingredienceMasterObj
      }
    ]);
    createResponse(Ingredience.length > 0 ? Ingredience[0] : [], 200, "Ingredience found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

ingredienceController.IngredienceList = async (req, res) => {
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
    const Ingredience = await IngredienceModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.ingredienceMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Ingredience,
      pagination: await commonFilter.paginationCalculation(Ingredience, limit, page)
    }
    createResponse(result, 200, "Ingredience found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

ingredienceController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let unitOfSales = await IngredienceModel.findById(id)
    if (!unitOfSales) {
      throw new CustomError("Ingredience not found", 404);
    }
    await IngredienceModel.findByIdAndUpdate(id, { $set: { status: unitOfSales.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Ingredience status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

ingredienceController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let restaurantCheck = await IngredienceModel.findById(id)
    if (!restaurantCheck) {
      throw new CustomError("Ingredience not found", 404);
    }
    await IngredienceModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Ingredience deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

ingredienceController.dropDown = async (req, res) => {
  try {
    let restaurantId =  convertIdToObjectId(req.restaurant._id)
    let result = await IngredienceModel.find({ restaurantId: restaurantId,status:"Active",isDeleted:false },{ name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}



module.exports = { ingredienceController }
