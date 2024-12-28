const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ItemModel = require("../../models/itemsModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");


exports.list = async (req, res) => {
    try {
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.cashier.restaurantId)
        matchObj.status = "Active"
        matchObj.categoryId = convertIdToObjectId(req.params.categoryId)

        
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
                    price: 1,
                    spiceLevel: 1
                }
            },
        ]);
        createResponse(result, 200, "Item retrive Successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}
