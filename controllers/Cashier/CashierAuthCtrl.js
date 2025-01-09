const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantStaffModel = require("../../models/restaurantStaffModel.js");
const niv = require("node-input-validator");
const LoginVerificationModel = require("../../models/loginVerification.js")
const otpHelper = require("../../helper/otpHelper.js")
const Helper = require("../../helper/helper.js")
const { convertIdToObjectId } = require("../../middlewares/commonFilter.js");
const restaurantModel = require("../../models/restaurantModel.js");

exports.login = async (req, res) => {
    try {
        const { userId, pin } = req?.body;
        const objValidation = new niv.Validator(req.body, {
            userId: "required",
            pin: "required",
        });
        const matched = await objValidation.check();
        if (!matched) {
            return res
                .status(422)
                .send({ message: "Validation error", errors: objValidation.errors });
        }

        const cashier = await RestaurantStaffModel.findOne({ userId, pin });
        if (!cashier || cashier?.isDeleted == true) {
            throw new CustomError("Invalid userId or password", 400);
        }
        if (cashier.status != "Active") {
            throw new CustomError("Cashier is not active please contact restaurant", 400);
        }

        cashier.token = await Helper.createJWT(cashier._id, cashier.email);
        cashier.save()

        const response = {
            data: {
                id: cashier?._id,
                firstName: cashier?.firstName,
                lastName: cashier?.lastName,
                mobile: cashier?.mobile,
                email: cashier?.email,
                gender: cashier?.gender,
                restaurantId: cashier?.restaurantId,
                image: cashier?.image,
            },
            token: cashier.token,
        };

        createResponse(response, 200, "Login successful", res);
    } catch (error) {
        console.log(error);
        errorHandler(error, req, res);
    }
}


exports.forgotPassword = async (req, res) => {
    try {
        const { email, } = req.body

        const objValidation = new niv.Validator(req.body, {
            email: "required|email",
        });
        const matched = await objValidation.check();
        if (!matched) {
            return res
                .status(422)
                .send({ message: "Validation error", errors: objValidation.errors });
        }

        const cashier = await RestaurantStaffModel.findOne({ email: email });
        if (!cashier || cashier?.status != "Active" || cashier?.isDeleted == true) {
            throw new CustomError("Cashier not found!", 404);
        }
        try {
            const otp = await Helper.generateRandomString(6, true)

            let checkEmail = await LoginVerificationModel.findOne({ email: email });
            if (checkEmail) { await LoginVerificationModel.findByIdAndUpdate(checkEmail._id, { $set: { otp: otp } }); }
            else { await LoginVerificationModel({ email: email, otp: otp, }).save(); }

            // await otpHelper.sendOTPEmail(email, otp, req, res)

            createResponse({}, 200, "OTP sent successfully", res);
        } catch (error) {
            throw new CustomError("Error in sending email", 400);
        }

    } catch (error) {
        errorHandler(error, req, res);
    }
}

// check verification code for forgot password 
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            email: "required|email",
            otp: "required",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }

        const checkOTP = await LoginVerificationModel.findOne({
            email: email,
        });
        if (checkOTP?.otp !== String(otp)) {
            throw new CustomError("Invalid OTP", 400);
        }
        createResponse({}, 200, "OTP verifiy successfully", res);

    } catch (error) {
        errorHandler(error, req, res);

    }
}

// check verification code for forgot password 
exports.resetPassword = async (req, res) => {
    try {
        let { email, otp, pin } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            email: "required|email",
            otp: "required",
            pin: "required|minLength:4",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }
        const checkOTP = await LoginVerificationModel.findOne({
            email: email,
        });
        if (checkOTP?.otp !== String(otp)) {
            throw new CustomError("Invalid OTP", 400);
        }
        await deleteOTP(email, otp);

        await RestaurantStaffModel.updateOne({ email: email }, { $set: { pin: pin } })
        createResponse({}, 200, "Password updated successfully", res);

    } catch (error) {
        errorHandler(error, req, res);

    }
}

// check verification code for forgot password 
exports.changePassword = async (req, res) => {
    try {
        let { pin } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            pin: "required|minLength:4",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }

        await RestaurantStaffModel.findByIdAndUpdate(req.cashier._id, { $set: { pin: pin } })
        createResponse({}, 200, "Password updated successfully", res);

    } catch (error) {
        errorHandler(error, req, res);

    }
}


//Drop down
exports.userListByRestaurantId = async (req, res) => {
    try {
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.params.restaurantId)
        matchObj.status = "Active"
        const result = await RestaurantStaffModel.aggregate([
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
                    firstName: 1,
                    userId: 1,
                    lastName: 1,
                    image: 1,
                }
            },
        ]);
        createResponse(result, 200, "Cashier retrive Successfully.", res);


    } catch (error) {
        errorHandler(error, req, res);

    }
}
exports.list = async (req, res) => {
    try {

        let query = [
            {
                $match: {
                    isDeleted: false,
                    status: 'Active'
                }
            },
            {
                $project: {
                    token: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    deletedAt: 0,

                }
            }
        ];

        if (req.query.restaurantId) {
            query.push({
                $match: {
                    _id: convertIdToObjectId(req.query.restaurantId)
                }
            })
        }

        const result = await restaurantModel.aggregate(query);



        createResponse(!req.query.restaurantId ? result : result[0], 200, "Restaurant retrive Successfully.", res);


    } catch (error) {
        errorHandler(error, req, res);

    }
}

const deleteOTP = async (email, otp) => {
    let deleteOTP = await LoginVerificationModel.findOneAndDelete({
        email: email,
        otp: String(otp),
    });
    if (!deleteOTP) {
        console.log("Unable to delete OTP");
    }
    console.log("OTP deleted");
};

