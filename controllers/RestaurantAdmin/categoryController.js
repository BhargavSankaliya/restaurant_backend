const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const CategoryModel = require("../../models/category.js");
const categoryController = {};
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

categoryController.createCategory = async (req, res, next) => {
  try {
    if (!req?.query?.id) {
      let { name } = req?.body;
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
    } else {
      const { id } = req?.query;
      const existing = await CategoryModel.findOne({
        _id: { $ne: id },
        $or: [
          { name: req?.body?.name.trim() },
        ]
      })
      if (existing) {
        throw new CustomError("category already exist!", 400);
      }
      const category = await CategoryModel.findOneAndUpdate({ _id: id }, req?.body, { new: true })
      if (!category) {
        throw new CustomError("Category could not be edited!!", 400);
      }
      createResponse(category, 200, "Category Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res)
  }
}

categoryController.categoryGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Category = await CategoryModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.categoryMasterObj
      }
    ]);
    createResponse(Category?.length > 0 ? Category[0] : [], 200, "Category found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

categoryController.categoryList = async (req, res) => {
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
    const Cuisines = await CategoryModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.categoryMasterObj
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
    createResponse(result, 200, "Category found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

categoryController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Cuisine = await CategoryModel.findById(id)
    if (!Cuisine) {
      throw new CustomError("Category not found", 404);
    }
    await CategoryModel.findByIdAndUpdate(id, { $set: { status: Cuisine.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Category status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

categoryController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let CuisineCheck = await CategoryModel.findById(id)
    if (!CuisineCheck) {
      throw new CustomError("Category not found", 404);
    }
    await CategoryModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Category deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { categoryController }
