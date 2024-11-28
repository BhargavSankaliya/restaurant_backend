const { CustomError, errorHandler } = require("../middlewares/error.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../environmentVariable.json");
const createResponse = require("../middlewares/response.js");
const RoleMasterModel = require("../models/roleMasterModel.js");
const { commonFilter, convertIdToObjectId } = require("../middlewares/commonFilter.js");
const roleMasterController = {};
const ObjectID = require("mongodb").ObjectId;


roleMasterController.createNewRole = async (req, res, next) => {
  try {

    let { roleName } = req.body;
    const findRole = await RoleMasterModel.findOne({ roleName: roleName, isDeleted: false });
    if (!!findRole) {
      if (findRole.roleName == roleName) {
        throw new CustomError("Role already exists!", 400);
      }
    }
    let newRoleCreated = await RoleMasterModel.create(
      req.body
    );
    createResponse(newRoleCreated, 200, "New Role Created Successfully.", res);
  } catch (error) {
    errorHandler(error, req, res)
  }
}

roleMasterController.updateRoleById = async (req, res, next) => {
  try {
    console.log("Start ssssssssssssssss")
    let { id, roleName } = req.body;
    const Role = await RoleMasterModel.findById(id);
    if (!Role) {
      throw new CustomError("Role not found!", 404);
    }
    console.log("Role", Role)
    let updatedRoleData = await RoleMasterModel.findOneAndUpdate({ _id: id }, { roleName: roleName })
    createResponse(updatedRoleData, 200, "Role updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.getRoleList = async (req, res, next) => {
  try {
    const { status, roleName } = req?.body; // Get the status from query parameters
    const page = parseInt(req?.body?.page) || 1; // Current page number
    const limit = parseInt(req?.body?.limit) || 10; // Number of users per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Initialize query condition
    let queryCondition = {
      isDeleted: false
    };

    // Set the query condition based on status
    if (status === 'Active') {
      queryCondition = { status: 'Active' }; // Only active users
    } else if (status === 'Inactive') {
      queryCondition = { status: 'Inactive' }; // Only inactive users
    } else if (status) {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    if (roleName) {
      queryCondition = {
        roleName: { $regex: roleName, $options: 'i' } // Case-insensitive regex search
      };
    }

    // Fetch users based on the query condition with pagination
    const users = await RoleMasterModel.find(queryCondition).skip(skip).limit(limit);
    const totalUsers = await RoleMasterModel.countDocuments(queryCondition); // Total count for pagination

    const response = {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users,
    };

    createResponse(response, 200, "Roles retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.toggleRoleStatus = async (req, res, next) => {
  try {
    const { status, id } = req?.body; // Expecting the new status from the request body

    // Validate status input
    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    // Find the Role by ID
    const Role = await RoleMasterModel.findById(id);
    if (!Role) {
      throw new CustomError("Role not found!", 404);
    }

    // Update the Role's status
    Role.status = status; // Update the status field
    await Role.save();

    createResponse(Role, 200, "Role status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.getRoleById = async (req, res, next) => {
  try {
    const { id } = req?.body; // Get the user ID from the URL parameters

    // Find the user by ID
    const user = await RoleMasterModel.findById(id);
    if (!user) {
      throw new CustomError("Role not found!", 404);
    }

    createResponse(user, 200, "Role retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.roleDelete = async (req, res, next) => {
  try {
    const { id } = req?.body; // Expecting the new status from the request body

    // Find the user by ID
    const Role = await RoleMasterModel.findById(id);
    if (!Role) {
      throw new CustomError("Role not found!", 404);
    }

    Role.isDeleted = true;
    await Role.save();

    createResponse(Role, 200, "Role deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};








module.exports = { roleMasterController }
