const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantModel = require("../../models/restaurantModel.js");
const RoleMasterModel = require("../../models/roleMasterModel.js")
const niv = require("node-input-validator");
const LoginVerificationModel = require("../../models/loginVerification.js")
const otpHelper = require("../../helper/otpHelper.js")
const Helper = require("../../helper/helper.js")

exports.login = async (req, res) => {
    try {
        const { email, password } = req?.body;
        const objValidation = new niv.Validator(req.body, {
            email: "required",
            password: "required",
        });
        const matched = await objValidation.check();
        if (!matched) {
            return res
                .status(422)
                .send({ message: "Validation error", errors: objValidation.errors });
        }

        const user = await RestaurantModel.findOne({ email });
        if (!user || user?.isDeleted == true) {
            throw new CustomError("Invalid email or password", 400);
        }
        if (user.status != "Active") {
            throw new CustomError("Restaurnat is not active please contact administration", 400);
        }

        const isPasswordValid = await Helper.comparePassword(password, user?.password);
        if (!isPasswordValid) {
            throw new CustomError("Invalid email or password", 400);
        }

        const roleDetails = await RoleMasterModel.findById(user?.roleId);
        if (!roleDetails) {
            throw new CustomError("Role details not found", 404);
        }

        user.token = await Helper.createJWT(user._id, user.email, user.roleId);
        user.save()

        const response = {
            user: {
                id: user?._id,
                name: user?.name,
                capacity: user?.capacity,
                address: user?.address,
                gstNumber: user?.gstNumber,
                email: user?.email,
                phoneNumber: user?.phoneNumber,
                website: user?.website,
                legalDoc: user?.legalDoc,
                logo: user?.logo,
                media: user?.media,
                openingHour: user?.openingHour,
            },
            token: user.token,
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

        const restaurant = await RestaurantModel.findOne({ email: email });
        if (!restaurant || restaurant?.status != "Active" || restaurant?.isDeleted == true) {
            throw new CustomError("Restaurant not found!", 404);
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
        if (checkOTP?.otp !== Number(otp)) {
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
        let { email, otp, password } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            email: "required|email",
            otp: "required",
            password: "required|minLength:6",
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
        if (checkOTP?.otp !== Number(otp)) {
            throw new CustomError("Invalid OTP", 400);
        }
        password = await Helper.bcyptPass(password)
        await deleteOTP(email, otp);

        await RestaurantModel.updateOne({ email: email }, { $set: { password: password } })
        createResponse({}, 200, "Password updated successfully", res);

    } catch (error) {
        errorHandler(error, req, res);

    }
}

// check verification code for forgot password 
exports.changePassword = async (req, res) => {
    try {
        let { password } = req.body;
        const ObjValidation = new niv.Validator(req.body, {
            password: "required|minLength:6",
        });
        const matched = await ObjValidation.check();
        if (!matched) {
            return res.status(422).json({
                message: "validation error",
                error: ObjValidation.errors,
            });
        }
        password = await Helper.bcyptPass(password)

        await RestaurantModel.findByIdAndUpdate(req.restaurant._id, { $set: { password: password } })
        createResponse({}, 200, "Password updated successfully", res);

    } catch (error) {
        errorHandler(error, req, res);

    }
}

const deleteOTP = async (email, otp) => {
    let deleteOTP = await LoginVerificationModel.findOneAndDelete({
        email:email,
        otp,
    });
    if (!deleteOTP) {
        console.log("Unable to delete OTP");
    }
    console.log("OTP deleted");
};

