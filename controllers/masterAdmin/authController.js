const { CustomError, errorHandler } = require("../../middlewares/error.js");
const bcrypt = require("bcrypt");
const createResponse = require("../../middlewares/response.js");
const MasterUserModel = require("../../models/userModel.js");
const RoleMasterModel = require("../../models/roleMasterModel.js");
const { commonFilter, convertIdToObjectId } = require("../../middlewares/commonFilter.js");
const authController = {};
const saltRounds = process.env.saltRounds;
const jwt = require("jsonwebtoken");
const niv = require("node-input-validator");
const otpHelper = require("../../helper/otpHelper.js")
const Helper = require("../../helper/helper.js")
const LoginVerificationModel = require("../../models/loginVerification.js")


authController.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req?.body;

    const user = await MasterUserModel.findOne({ email });
    if (!user) {
      throw new CustomError("Invalid email or password", 400);
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid email or password", 400);
    }

    const roleDetails = await RoleMasterModel.findById(user?.role);
    if (!roleDetails) {
      throw new CustomError("Role details not found", 404);
    }

    const token = jwt.sign(
      { id: user?._id, email: user?.email ,roleId:user?.role},
      process.env.JWT_SECRET,
      { expiresIn: process.env.expiresIn }
    );

    user.token = token;
    user.save()

    const response = {
      user: {
        id: user?._id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone,
        gender: user?.gender,
        role: {
          id: user?.role,
          roleName: roleDetails?.roleName,
          permissions: roleDetails?.permissions,
        },
      },
      token,
    };

    createResponse(response, 200, "Login successful", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};


authController.createUser = async (req, res, next) => {
  try {

    if (req.query.userId) {
      const user = await MasterUserModel.findById(req.query.userId);
      if (!user) {
        throw new CustomError("User not found!", 404);
      }

      if (!!req.body.role) {
        req.body.role = convertIdToObjectId(req.body.role)
      }

      const update = await MasterUserModel.findOneAndUpdate({ _id: convertIdToObjectId(req.query.userId) }, req.body)

      return createResponse(null, 200, "User Details Updated Successfully.", res);

    }
    else {
      const findUser = await MasterUserModel.findOne({ email: req.body.email });
      if (!!findUser) {
        throw new CustomError("Email already exists!", 400);
      }

      const findRole = await RoleMasterModel.findById(req.body.role);
      if (!findRole) {
        throw new CustomError("Invalid Role ID provided!", 400);
      }

      req.body.password = await bcrypt.hash(req.body.password, parseInt(saltRounds));

      let userCreated = await MasterUserModel.create(req?.body);
      return createResponse(null, 200, "User Created Successfully.", res);
    }

  } catch (error) {
    errorHandler(error, req, res);
  }
};


authController.getUsersList = async (req, res, next) => {
  try {
    const { status } = req?.query;

    let query = [
      {
        $lookup: {
          from: "mastersroles",
          localField: "role",
          foreignField: "_id",
          as: "roleDetails"
        }
      },
      {
        $unwind: {
          path: "$roleDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          roleName: "$roleDetails.roleName"
        }
      },
      {
        $project: commonFilter.userMasterObject
      }
    ]

    if (!!status) {
      query.push({
        $match: {
          status: status
        }
      })
    }

    const users = await MasterUserModel.aggregate(query);

    createResponse(users, 200, "Users retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req?.query;

    if (!id) {
      throw new CustomError("RoleID is required!", 404);
    }
    const userDetails = await MasterUserModel.findById(id);

    if (userDetails.status == 'Active') {
      userDetails.status = 'Inactive'
    }
    else {
      userDetails.status = 'Active'
    }

    await userDetails.save();

    createResponse(null, 200, `User ${userDetails.status}d successfully.`, res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.getUserById = async (req, res, next) => {
  try {
    const { id } = req?.params;

    const user = await MasterUserModel.findById(id);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    createResponse(user, 200, "User retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.forgotPassword = async (req, res) => {
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

    const user = await MasterUserModel.findOne({ email: email });
    if (!user || user?.status != "Active" || user?.isDeleted == true) {
      throw new CustomError("User not found!", 404);
    }
    try {
      const otp = await Helper.generateRandomString(6, true)
      console.log(otp, typeof (otp));

      let checkEmail = await LoginVerificationModel.findOne({ email: email });
      if (checkEmail) { await LoginVerificationModel.findByIdAndUpdate(checkEmail._id, { $set: { otp: otp } }); }
      else { await LoginVerificationModel({ email: email, otp: otp, }).save(); }

      // await otpHelper.sendOTPEmail(email, otp, req, res)

      createResponse({}, 201, "OTP sent successfully", res);
    } catch (error) {
      throw new CustomError("Error in sending email", 400);
    }

  } catch (error) {
    errorHandler(error, req, res);
  }
}

// check verification code for forgot password 
authController.verifyOTP = async (req, res) => {
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
authController.resetPassword = async (req, res) => {
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

    await MasterUserModel.updateOne({ email: email }, { $set: { password: password } })
    createResponse({}, 200, "Password updated successfully", res);

  } catch (error) {
    errorHandler(error, req, res);

  }
}

// check verification code for forgot password 
authController.changePassword = async (req, res) => {
  try {
    let {   password } = req.body;
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

    await MasterUserModel.findByIdAndUpdate(req.masterUser._id, { $set: { password: password } })
    createResponse({}, 200, "Password updated successfully", res);

  } catch (error) {
    errorHandler(error, req, res);

  }
}

const deleteOTP = async (email, code) => {
  let deleteOTP = await LoginVerificationModel.findOneAndDelete({
    email: {
      $regex: email,
      $options: "i",
    },
    code,
  });
  if (!deleteOTP) {
    console.log("Unable to delete OTP");
  }
  console.log("OTP deleted");
};



module.exports = { authController }

