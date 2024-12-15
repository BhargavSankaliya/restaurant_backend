const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const CustomerModel = require("../../models/customerModel.js");
const RestaurantModel = require("../../models/restaurantModel.js");
const { commonFilter, convertIdToObjectId } = require("../../middlewares/commonFilter.js");
const niv = require("node-input-validator");
const smsHelper = require("../../helper/smsHelper.js")
const Helper = require("../../helper/helper.js")
const LoginVerificationModel = require("../../models/loginVerification.js");

exports.SendOtp = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, conutryCode, roleId } = req?.body;
        const ObjValidation = new niv.Validator(req.body, {
            firstName: "required",
            lastName: "required",
            conutryCode: "required|minLength:2|maxLength:4",
            phoneNumber: "required|minLength:6|maxLength:16",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }
        let otp = Helper.generateRandomString(6, true)
        let smsData = {
            phoneNumber, conutryCode, otp
        }
        let otpObj = {}
        otpObj.phoneNumber = phoneNumber
        otpObj.conutryCode = conutryCode
        otpObj.otp = otp

        let otpModelCheck = await LoginVerificationModel.findOne({ phoneNumber: phoneNumber, conutryCode: conutryCode })
        if (otpModelCheck) {
            await LoginVerificationModel.findByIdAndUpdate(otpModelCheck._id, { $set: { otp: otp } })
        } else {
            await LoginVerificationModel(otpObj).save()
        }
        // await smsHelper.sendSms(smsData, req, res)
        let dataCheck = await CustomerModel.findOne({ phoneNumber: phoneNumber, conutryCode: conutryCode })

        if (!dataCheck) {
            let newObj = {}
            newObj.phoneNumber = phoneNumber
            newObj.conutryCode = conutryCode
            newObj.firstName = firstName
            newObj.lastName = lastName
            newObj.roleId = roleId
            await CustomerModel(newObj).save()
        }

        createResponse({}, 200, "Otp sent successfully", res);
    } catch (error) {
        console.log("Error", error)
        errorHandler(error, req, res);
    }
};



// check verification code for forgot password 
exports.verifyOTP = async (req, res) => {
    try {
        const { conutryCode, phoneNumber, otp ,restaurantId} = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            conutryCode: "required|minLength:2|maxLength:4",
            restaurantId: "required",
            phoneNumber: "required|minLength:6|maxLength:16",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }

        const checkOTP = await LoginVerificationModel.findOne({
            phoneNumber: phoneNumber, conutryCode: conutryCode
        });
        if (!checkOTP) {
            throw new CustomError("Invalid phone number or country code", 400);
        }
        if (checkOTP?.otp !== Number(otp)) {
            throw new CustomError("Invalid OTP", 400);
        }
        let restaurant =await RestaurantModel.findById(restaurantId)
        if(!restaurant){
            throw new CustomError("Restaurant not found" ,400)
        }
        let data = await CustomerModel.findOne({ phoneNumber: phoneNumber, conutryCode: conutryCode })
        if (!data) {
            throw new CustomError("Something went wrong!", 400);
        }
        let token = await Helper.createJWT(data._id, "", data.roleId)
        let result = {
            token,
            firstName: data.firstName,
            lastName: data.lastName,
            conutryCode: data.conutryCode,
            phoneNumber: data.phoneNumber,
            restaurantName:restaurant.name,
            restaurantAddress:restaurant.address,
        }
        deleteOTP(phoneNumber, conutryCode, otp)

        createResponse(result, 200, "Login successful", res);

    } catch (error) {
        console.log(error);
        errorHandler(error, req, res);
    }
}

exports.resendOTP = async (req, res) => {
    try {
        const { conutryCode, phoneNumber } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            conutryCode: "required|minLength:2|maxLength:4",
            phoneNumber: "required|minLength:6|maxLength:16",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }
        let otp = Helper.generateRandomString(6, true)
        let smsData = {
            phoneNumber, conutryCode, otp
        }
        let otpObj = {}
        otpObj.phoneNumber = phoneNumber
        otpObj.conutryCode = conutryCode
        otpObj.otp = otp

        let otpModelCheck = await LoginVerificationModel.findOne({ phoneNumber: phoneNumber, conutryCode: conutryCode })
        if (otpModelCheck) {
            await LoginVerificationModel.findByIdAndUpdate(otpModelCheck._id, { $set: { otp: otp } })
        } else {
            await LoginVerificationModel(otpObj).save()
        }
        // await smsHelper.sendSms(smsData, req, res)

        createResponse({}, 200, "Otp resent successfully", res);

    } catch (error) {
        console.log(error);
        errorHandler(error, req, res);
    }
}

const deleteOTP = async (phoneNumber, conutryCode, otp) => {
    let deleteOTP = await LoginVerificationModel.findOneAndDelete({
        phoneNumber: phoneNumber,
        conutryCode: conutryCode,
        otp: otp,
    });
    if (!deleteOTP) {
        console.log("Unable to delete OTP");
    }
    console.log("OTP deleted");
};




