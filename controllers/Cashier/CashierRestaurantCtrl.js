const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantModel = require("../../models/restaurantModel.js");



exports.list = async (req, res) => {
    try {

        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.status = "Active"
        const result = await RestaurantModel.aggregate([
            {
                $match: matchObj
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $project: {
                    _id:1,
                    name:1
                }
            },
        ]);

        createResponse(result, 200, "Restaurant retrieved successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
}
