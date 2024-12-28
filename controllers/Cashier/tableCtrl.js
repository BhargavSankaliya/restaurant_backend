const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const TableModel = require("../../models/restaurantTableModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");


exports.list = async (req, res) => {
    try {
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.cashier.restaurantId)
        matchObj.status = "Active"
        
        const result = await TableModel.aggregate([
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
                    tableNumber: 1,
                    openTime:1,
                    qrcode:1,
                    capacity: 1
                }
            },
        ]);
        createResponse(result, 200, "Table retrive Successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}
