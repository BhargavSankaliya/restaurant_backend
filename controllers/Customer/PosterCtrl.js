const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const PosterModel = require("../../models/restaurantPosterModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

exports.list = async (req, res) => {
    try {
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.params.restaurantId)
        matchObj.status = "Active"
        const result = await PosterModel.aggregate([
            {
                $match: matchObj
            },
            {
                $sort: {
                    createdAt: -1
                }
            },

        ]);
        createResponse(result, 200, "Poster retrive Successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}




