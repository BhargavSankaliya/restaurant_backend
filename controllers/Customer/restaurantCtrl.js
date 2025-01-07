const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantModel = require("../../models/restaurantModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

exports.restaurantDetails = async (req, res) => {
    try {
        let restaurantId = req.params.restaurantId
        let result = await RestaurantModel.aggregate([
            {
                $match: {
                    _id: convertIdToObjectId(restaurantId)
                }
            },
            {
                $project: {
                    name: 1,
                    capacity: 1,
                    address: 1,
                    gstNumber: 1,
                    phoneNumber: 1,
                    email: 1,
                    website: 1,
                    logo: 1,
                    media: 1,
                    legalDoc: 1,
                    openingHour: 1
                }

            }
        ])
        if (result.length == 0) {
            return createResponse([], 200, "No data found.", res);
        }
        createResponse(result[0], 200, "Restaurant retrive successfully", res)
    } catch (error) {
        errorHandler(error, req, res);

    }
}