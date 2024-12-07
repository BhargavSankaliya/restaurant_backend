const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantModel = require("../../models/restaurantModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const Helper = require("../../helper/helper.js")

exports.create = async (req, res) => {
    try {
        let { name, capacity, address, gstNumber, phoneNumber, email, website, logo, media, legalDoc, openingHour, password } = req.body;

        if (req?.query?.restaurantId) {
            let restaurantId = convertIdToObjectId(req?.query?.restaurantId)
            let phoneNumberCheck = await RestaurantModel.findOne({ _id: { $ne: restaurantId }, phoneNumber: phoneNumber })
            if (phoneNumberCheck) {
                throw new CustomError("Phoone number already exists!", 400);
            }
            let emailCheck = await RestaurantModel.findOne({ _id: { $ne: restaurantId }, phoneNumber: phoneNumber })
            if (emailCheck) {
                throw new CustomError("Email already exists!", 400);
            }
            if (password) {
                try {
                    password = await Helper.bcyptPass(password)
                    req.body.password = password
                } catch (error) {
                    throw new CustomError("Bcrypt password error", 400)
                }
            }
            await RestaurantModel.findByIdAndUpdate(restaurantId, { $set: req.body })
            createResponse({}, 200, "Restaurant updated successfully.", res);

        }
        else {
            let phoneNumberCheck = await RestaurantModel.findOne({ phoneNumber: phoneNumber })
            if (phoneNumberCheck) {
                throw new CustomError("Phoone number already exists!", 400);
            }
            let emailCheck = await RestaurantModel.findOne({ phoneNumber: phoneNumber })
            if (emailCheck) {
                throw new CustomError("Email already exists!", 400);
            }
            try {
                password = await Helper.bcyptPass(password)
            } catch (error) {
                throw new CustomError("Bcrypt password error", 400)
            }

            req.body.password = password
            const result = await RestaurantModel.create(req?.body);
            createResponse(result, 200, "Restaurant created successfully.", res);
        }

    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.toggleStatus = async (req, res) => {
    try {
        let restaurantId = convertIdToObjectId(req.params.restaurantId)
        let restaurantCheck = await RestaurantModel.findById(restaurantId)
        if (!restaurantCheck) {
            throw new CustomError("Restaurant not found", 404);
        }
        await RestaurantModel.findByIdAndUpdate(restaurantId, { $set: { status: restaurantCheck.status == "Active" ? "Inactive" : "Active" } })
        createResponse(result, 200, "Restaurant status updated successfully.", res);

    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.delete = async (req, res) => {
    try {
        let restaurantId = convertIdToObjectId(req.params.restaurantId)
        let restaurantCheck = await RestaurantModel.findById(restaurantId)
        if (!restaurantCheck) {
            throw new CustomError("Restaurant not found", 404);
        }
        await RestaurantModel.findByIdAndUpdate(restaurantId, { $set: { isDeleted: true } })
        createResponse(result, 200, "Restaurant deleted successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.list = async (req, res) => {
    try {
        console.log("hhhhhhhhhhhh");
        
        const { status, limit, page } = req?.query;
        let matchObj = {}
        matchObj.isDeleted = false
        if (!limit) {
            limit = 10
        }
        if (!page) {
            page = 1
        }
        let skip = (page - 1) * limit
        let filterObj = {
            $skip: skip,
            $limit: limit
        }
        if (status) {
            matchObj.status = status
        }
        const restaurant = await RestaurantModel.aggregate([
            {
                $match: matchObj
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: commonFilter.restaurantMasterObj
            },
            filterObj
        ]);
        let result = {
            data: restaurant,
            pagination: await commonFilter.paginationCalculation(restaurant, limit, page)
        }

        createResponse(result, 200, "Restaurant retrieved successfully.", res);
    } catch (error) {
        console.log(error);
        
        errorHandler(error, req, res);
    }
}


exports.get = async (req, res) => {
    try {

        const restaurant = await RestaurantModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    status: "Active"
                }
            },
            {
                $project: commonFilter.restaurantMasterObj
            },
        ]);
        if (restaurant.length == 0) {
            throw new CustomError("No data found", 404)
        }
        createResponse(restaurant[0], 200, "Restaurant retrieved successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}