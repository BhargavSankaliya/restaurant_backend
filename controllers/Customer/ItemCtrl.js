const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ItemModel = require("../../models/itemsModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");


exports.List = async (req, res) => {
    try {
        let { search } = req.query
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.categoryId = convertIdToObjectId(req.params.categoryId)
        matchObj.status = "Active"
        if (search) {
            matchObj.name = { $regex: search, $options: "i" }
        }
        const result = await ItemModel.aggregate([
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
                    description: 1,
                    price: 1
                }
            },
        ]);
        createResponse(result, 200, "Items retrive Successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
}
