const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const UserModel = require("../models/userModel.js");
const RoleMasterModel = require("../models/roleMasterModel.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const authController = {};
const saltRounds = process.env.saltRounds;
const jwt = require("jsonwebtoken");



authController.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req?.body;

    const user = await UserModel.findOne({ email });
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
    let { email, password, role, phone } = req?.body;
    if (!!req?.files?.coverPicture) {
      req.body.coverPicture = req?.files?.coverPicture[0]?.filename;
    }
    if (!!req?.files?.profilePicture) {
      req.body.profilePicture = req?.files?.profilePicture[0]?.filename;
    }
    const findUser = await UserModel.findOne({ email });
    if (!!findUser) {
      throw new CustomError("Email already exists!", 400);
    }
    const findRole = await RoleMasterModel.findById(role);
    if (!findRole) {
      throw new CustomError("Invalid Role ID provided!", 400);
    }
    req.body.password = await bcrypt.hash(password ? password : phone, saltRounds);
    let userCreated = await UserModel.create(req?.body);
    createResponse(userCreated, 200, "User Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.updateUserById = async (req, res, next) => {
  try {
    let updateData = req.body;
    if (req?.files) {
      if (req?.files?.coverPicture) {
        updateData.coverPicture = req?.files?.coverPicture[0]?.filename;
      }
      if (req?.files?.profilePicture) {
        updateData.profilePicture = req?.files?.profilePicture[0]?.filename;
      }
    }
    const userId = updateData?.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }
    if (updateData?.email) {
      const existingUser = await UserModel.findOne({
        email: updateData?.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new CustomError("Email already exists!", 400);
      }
    }
    Object.assign(user, updateData);
    await user.save();
    createResponse(user, 200, "User updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.getUsersList = async (req, res, next) => {
  try {
    const { status, searchKeyword } = req?.body;
    const page = parseInt(req?.body?.page) || 1;
    const limit = parseInt(req?.body?.limit) || 10;
    const skip = (page - 1) * limit;

    let queryCondition = {};

    if (status) {
      if (status === 'Active') {
        queryCondition.status = 'Active';
      } else if (status === 'Inactive') {
        queryCondition.status = 'Inactive';
      } else {
        throw new CustomError("Invalid status. Use 'Active' or 'Inactive'.", 400);
      }
    }

    if (searchKeyword) {
      queryCondition.$or = [
        { firstName: { $regex: searchKeyword, $options: 'i' } },
        { lastName: { $regex: searchKeyword, $options: 'i' } },
        { email: { $regex: searchKeyword, $options: 'i' } },
        { phone: { $regex: searchKeyword, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(queryCondition).skip(skip).limit(limit);
    const totalUsers = await UserModel.countDocuments(queryCondition);
    let pagination = await commonFilter.paginationCalculation(users, limit, page)

    const response = {
      users,
      pagination
    };

    createResponse(response, 200, "Users retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.toggleUserStatus = async (req, res, next) => {
  try {
    const { status, id } = req?.body;

    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    user.status = status;
    await user.save();

    createResponse(user, 200, "User status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

authController.getUserById = async (req, res, next) => {
  try {
    const { id } = req?.body;

    const user = await UserModel.findById(id);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    createResponse(user, 200, "User retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { authController }
