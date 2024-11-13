const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const UserModel = require("../models/userModel.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const authController = {};

authController.createUser = async (req, res, next) => {
  try {

    let { firstName, lastName, email, phone, location, address, isVerified, gender, coverPicture, profilePicture, Status } = req.body;
    if (!!req.files.coverPicture) {
      req.body.coverPicture = req.files.coverPicture[0].filename;
    }
    if (!!req.files.profilePicture) {
      req.body.profilePicture = req.files.profilePicture[0].filename;
    }

    const findUser = await UserModel.findOne({ email });

    if (!!findUser) {
      if (findUser.email === email) {
        throw new CustomError("Email already exists!", 400);
      }
    }


    let userCreated = await UserModel.create(
      req.body
    );

    createResponse(userCreated, 200, "User Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res)
  }
}
authController.updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params; // Get the user ID from the URL parameters
    let updateData = req.body;

    // Handle file uploads for coverPicture and profilePicture
    if (req.files) {
      if (req.files.coverPicture) {
        updateData.coverPicture = req.files.coverPicture[0].filename;
      }
      if (req.files.profilePicture) {
        updateData.profilePicture = req.files.profilePicture[0].filename;
      }
    }

    // Find the user by ID
    const user = await UserModel.findById(id);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    // Update the user with the new data
    Object.assign(user, updateData);
    await user.save();

    createResponse(user, 200, "User updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};
authController.getUsersByStatus = async (req, res, next) => {
  try {
    const { status } = req.query; // Get the status from query parameters
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of users per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Initialize query condition
    let queryCondition = {};

    // Set the query condition based on status
    if (status === 'Active') {
      queryCondition = { status: 'Active' }; // Only active users
    } else if (status === 'Inactive') {
      queryCondition = { status: 'Inactive' }; // Only inactive users
    } else if (status) {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    // Fetch users based on the query condition with pagination
    const users = await UserModel.find(queryCondition).skip(skip).limit(limit);
    const totalUsers = await UserModel.countDocuments(queryCondition); // Total count for pagination

    const response = {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users,
    };

    createResponse(response, 200, "Users retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};
authController.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // Get the user ID from the URL parameters
    const { status } = req.body; // Expecting the new status from the request body

    // Validate status input
    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    // Find the user by ID
    const user = await UserModel.findById(id);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    // Update the user's status
    user.status = status; // Update the status field
    await user.save();

    createResponse(user, 200, "User status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};
authController.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params; // Get the user ID from the URL parameters

    // Find the user by ID
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
