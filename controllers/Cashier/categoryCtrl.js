const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const CategoryModel = require("../../models/categoryModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");



exports.categoryGetById = async (req, res) => {
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

exports.categoryList = async (req, res) => {
    try {
        let { status, limit, page } = req?.query;
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.cashier.restaurantId)
        matchObj.status = status
        if (!limit) {
            limit = 10
        }
        if (!page) {
            page = 1
        }
        let skip = (Number(page) - 1) * Number(limit)
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
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    description: 1
                }
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
        createResponse(result, 200, "Category retrive Successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}
