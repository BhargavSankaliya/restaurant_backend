const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const CouponModel = require("../../models/couponModel.js");


exports.List = async (req, res) => {
    try {
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.params.restaurantId)
        matchObj.status = "Active"

        const result = await CouponModel.aggregate([
            {
                $match: matchObj
            },
        ]);
        createResponse(result, 200, "Coupons retrive Successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
}
