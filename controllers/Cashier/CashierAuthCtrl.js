const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const CashierModel = require("../../models/CashierModel.js");
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

        const cashier = await CashierModel.findOne({ email });
        if (!cashier || cashier?.isDeleted == true) {
            throw new CustomError("Invalid email or password", 400);
        }
        if (cashier.status != "Active") {
            throw new CustomError("Cashier is not active please contact restaurant", 400);
        }

        const isPasswordValid = await Helper.comparePassword(password, cashier?.password);
        if (!isPasswordValid) {
            throw new CustomError("Invalid email or password", 400);
        }


        cashier.token = await Helper.createJWT(cashier._id, cashier.email);
        cashier.save()

        const response = {
            data: {
                id: cashier?._id,
                name: cashier?.name,
                email: cashier?.email,
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

        const cashier = await CashierModel.findOne({ email: email });
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

        await CashierModel.updateOne({ email: email }, { $set: { password: password } })
        createResponse({}, 200, "Password updated successfully", res);

    } catch (error) {
        console.log(error);
        
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

        await CashierModel.findByIdAndUpdate(req.cashier._id, { $set: { password: password } })
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

