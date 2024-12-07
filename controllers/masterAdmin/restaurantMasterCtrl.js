const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantModel = require("../../models/restaurantModel.js");
const Helper = require("../../helper/helper.js")

exports.create = async (req, res) => {
    try {
        let { name, capacity,  address, gstNumber, phoneNumber, email, website, logo, media, legalDoc, openingHour ,password} = req.body;

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

    } catch (error) {
        errorHandler(error, req, res);
    }
}

