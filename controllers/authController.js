const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const MasterUserModel = require("../models/userModel.js");
const RoleMasterModel = require("../models/roleMasterModel.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const authController = {};
const saltRounds = process.env.saltRounds;
const jwt = require("jsonwebtoken");



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
      { id: user?._id, email: user?.email },
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

module.exports = { authController }
