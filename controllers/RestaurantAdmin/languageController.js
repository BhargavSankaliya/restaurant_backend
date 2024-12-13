const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const LanguageModel = require("../../models/languageModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const languageController = {};

languageController.createLanguage = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name } = req?.body;
      const findLanguage = await LanguageModel.findOne({ name, restaurantId, isDeleted: false, });
      if (findLanguage) {
        throw new CustomError("Language already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let LanguageCreated = await LanguageModel.create(createObj);
      createResponse(LanguageCreated, 200, "Language Created Successfully.", res);
    } else {
      const { id } = req?.query;
      const existing = await LanguageModel.findOne({
        _id: { $ne: convertIdToObjectId(id) },
        restaurantId: restaurantId,
        isDeleted: false,
        name: req?.body?.name,
      });
      if (existing) {
        throw new CustomError("Language already exists!", 400);
      }
      const Language = await LanguageModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!Language) {
        throw new CustomError("Language could not be edited!", 400);
      }
      createResponse(Language, 200, "Language Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

languageController.languageGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Cuisines = await LanguageModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.languageMasterObj
      }
    ]);
    createResponse(Cuisines?.length > 0 ? Cuisines[0] : [], 200, "Language found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

languageController.languageList = async (req, res) => {
  try {
    let { status, limit, page } = req?.query;
    let matchObj = {}
    matchObj.isDeleted = false
    matchObj.restaurantId = convertIdToObjectId(req.restaurant._id)
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
    const Language = await LanguageModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.languageMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Language,
      pagination: await commonFilter.paginationCalculation(Language, limit, page)
    }
    createResponse(result, 200, "Language found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

languageController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Language = await LanguageModel.findById(id)
    if (!Language) {
      throw new CustomError("Language not found", 404);
    }
    await LanguageModel.findByIdAndUpdate(id, { $set: { status: Language.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Language status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

languageController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let LanguageCheck = await LanguageModel.findById(id)
    if (!LanguageCheck) {
      throw new CustomError("Language not found", 404);
    }
    await LanguageModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Language deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


languageController.dropDown = async (req, res) => {
  try {

    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await LanguageModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { languageController };
