const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RoleMasterModel = require("../../models/roleMasterModel.js");
const roleMasterController = {};


roleMasterController.roleCreateUpdate = async (req, res, next) => {
  try {

    if (req.query.roleId) {

      if (req.body.permissions && req.body.permissions.length > 0) {
        req.body.permissions.map((x) => {
          x.menuId = convertIdToObjectId(x.menuId);
        })
      }

      let update = await RoleMasterModel.findOneAndUpdate(
        { _id: convertIdToObjectId(req.query.roleId) },
        { ...req.body },
        { new: true }
      );
      return createResponse(null, 200, "Role Details Updated successfully.", res);
    }
    else {
      const { roleName, permissions } = req.body;

      if (req.body.permissions && req.body.permissions.length > 0) {
        req.body.permissions.map((x) => {
          x.menuId = convertIdToObjectId(x.menuId);
        })
      }

      const findRole = await RoleMasterModel.findOne({ roleName, isDeleted: false });
      if (findRole) {
        throw new CustomError("Role already exists!", 400);
      }

      const newRoleCreated = await RoleMasterModel.create(req.body);
      return createResponse(null, 200, "Role created successfully.", res);
    }

  } catch (error) {
    errorHandler(error, req, res);
  }
};


roleMasterController.roleList = async (req, res, next) => {
  try {
    const { status } = req?.query;

    let query = !!status ? [
      {
        $match: {
          status: status,
          isDeleted: false
        }
      },
      {
        $project: commonFilter.roleMasterObject
      }
    ] : [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $project: commonFilter.roleMasterObject
      }
    ]

    const roles = await RoleMasterModel.aggregate(query);

    createResponse(roles, 200, "Roles retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.toggleRoleStatus = async (req, res, next) => {
  try {
    const { id } = req?.query;

    if (!id) {
      throw new CustomError("RoleID is required!", 404);
    }
    const Role = await RoleMasterModel.findById(id);

    if (Role.status == 'Active') {
      Role.status = 'Inactive'
    }
    else {
      Role.status = 'Active'
    }

    await Role.save();

    createResponse(null, 200, `Role ${Role.status}d successfully.`, res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

roleMasterController.getRoleById = async (req, res, next) => {
  try {
    const { id } = req?.params;

    const role = await RoleMasterModel.findById(id);
    if (!role) {
      throw new CustomError("Role not found!", 404);
    }

    createResponse(role, 200, "Role retrieved successfully.", res);
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
