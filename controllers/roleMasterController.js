const { CustomError, errorHandler } = require("../middlewares/error.js");
const createResponse = require("../middlewares/response.js");
const RoleMasterModel = require("../models/roleMasterModel.js");
const roleMasterController = {};


roleMasterController.createNewRole = async (req, res, next) => {
  try {
    const { roleName, permissions } = req.body;
    const findRole = await RoleMasterModel.findOne({ roleName, isDeleted: false });
    if (findRole) {
      throw new CustomError("Role already exists!", 400);
    }
    const defaultPermissions = permissions
    const newRoleData = {
      roleName,
      permissions: defaultPermissions,
    };
    const newRoleCreated = await RoleMasterModel.create(newRoleData);
    createResponse(newRoleCreated, 200, "New role created successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.updateRoleById = async (req, res, next) => {
  try {
    let { id, roleName, permissions } = req.body;

    const Role = await RoleMasterModel.findById(id);
    if (!Role) {
      throw new CustomError("Role not found!", 404);
    }

    const existingRole = await RoleMasterModel.findOne({
      roleName: roleName,
      _id: { $ne: id },
    });

    if (existingRole) {
      throw new CustomError("Role name already exists!", 400);
    }

    const defaultPermissions = permissions
    let updatedRoleData = await RoleMasterModel.findOneAndUpdate(
      { _id: id },
      { roleName: roleName, permissions: defaultPermissions },
      { new: true }
    );

    createResponse(updatedRoleData, 200, "Role updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};


roleMasterController.getRoleList = async (req, res, next) => {
  try {
    const { status, roleName } = req?.body;
    const page = parseInt(req?.body?.page) || 1;
    const limit = parseInt(req?.body?.limit) || 10;
    const skip = (page - 1) * limit;

    let queryCondition = {
      isDeleted: false
    };

    if (status === 'Active') {
      queryCondition = { status: 'Active' };
    } else if (status === 'Inactive') {
      queryCondition = { status: 'Inactive' };
    } else if (status) {
      throw new CustomError("Invalid status. Role 'active' or 'inactive'.", 400);
    }

    if (roleName) {
      queryCondition = {
        roleName: { $regex: roleName, $options: 'i' }
      };
    }

    const users = await RoleMasterModel.find(queryCondition).skip(skip).limit(limit);
    const totalUsers = await RoleMasterModel.countDocuments(queryCondition);

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
    const { status, id } = req?.body;

    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    const Role = await RoleMasterModel.findById(id);
    if (!Role) {
      throw new CustomError("Role not found!", 404);
    }

    Role.status = status;
    await Role.save();

    createResponse(Role, 200, "Role status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.getRoleById = async (req, res, next) => {
  try {
    const { id } = req?.body;

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
    const { id } = req?.body;

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
