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
        const { firstName, lastName, phoneNumber, dialCode, roleId } = req?.body;
        const ObjValidation = new niv.Validator(req.body, {
            firstName: "required",
            lastName: "required",
            dialCode: "required|minLength:2|maxLength:4",
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
            phoneNumber, dialCode, otp
        }
        let otpObj = {}
        otpObj.phoneNumber = phoneNumber
        otpObj.dialCode = dialCode
        otpObj.otp = otp

        let otpModelCheck = await LoginVerificationModel.findOne({ phoneNumber: phoneNumber, dialCode: dialCode })
        if (otpModelCheck) {
            await LoginVerificationModel.findByIdAndUpdate(otpModelCheck._id, { $set: { otp: otp } })
        } else {
            await LoginVerificationModel(otpObj).save()
        }
        // await smsHelper.sendSms(smsData, req, res)
        let dataCheck = await CustomerModel.findOne({ phoneNumber: phoneNumber, dialCode: dialCode })

        if (!dataCheck) {
            let newObj = {}
            newObj.phoneNumber = phoneNumber
            newObj.dialCode = dialCode
            newObj.firstName = firstName
            newObj.lastName = lastName
            await CustomerModel.create(newObj)
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
        const { dialCode, phoneNumber, otp } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            dialCode: "required|minLength:2|maxLength:6",
            otp: "required",
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
            phoneNumber: phoneNumber, dialCode: dialCode
        });
        if (!checkOTP) {
            throw new CustomError("Invalid phone number or country code", 400);
        }
        if (checkOTP?.otp !== Number(otp)) {
            throw new CustomError("Invalid OTP", 400);
        }

        let data = await CustomerModel.findOne({ phoneNumber: phoneNumber, dialCode: dialCode })
        if (!data) {
            throw new CustomError("Something went wrong!", 400);
        }
        let token = await Helper.createJWT(data._id, "", "")
        let result = {
            token,
            firstName: data.firstName,
            lastName: data.lastName,
            dialCode: data.dialCode,
            phoneNumber: data.phoneNumber,
        }
        await deleteOTP(phoneNumber, dialCode, otp)

        createResponse(result, 200, "Login successful", res);

    } catch (error) {
        console.log(error);
        errorHandler(error, req, res);
    }
}

exports.resendOTP = async (req, res) => {
    try {
        const { dialCode, phoneNumber } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            dialCode: "required|minLength:2|maxLength:4",
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
            phoneNumber, dialCode, otp
        }
        let otpObj = {}
        otpObj.phoneNumber = phoneNumber
        otpObj.dialCode = dialCode
        otpObj.otp = otp

        let otpModelCheck = await LoginVerificationModel.findOne({ phoneNumber: phoneNumber, dialCode: dialCode })
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

const deleteOTP = async (phoneNumber, dialCode, otp) => {
    let deleteOTP = await LoginVerificationModel.findOneAndDelete({
        phoneNumber: phoneNumber,
        dialCode: dialCode,
        otp: otp,
    });
    if (!deleteOTP) {
        console.log("Unable to delete OTP");
    }
    console.log("OTP deleted");
};




