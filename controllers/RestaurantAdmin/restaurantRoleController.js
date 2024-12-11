const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantRoleModel = require("../../models/restaurantRoleModel.js");
const restaurantRoleController = {};


restaurantRoleController.roleCreateUpdate = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req?.restaurant?._id)
    if (req?.query?.roleId) {

      if (req.body.permissions && req.body.permissions.length > 0) {
        req.body.permissions.map((x) => {
          x.menuId = convertIdToObjectId(x.menuId);
        })
      }

      let update = await RestaurantRoleModel.findOneAndUpdate(
        { _id: convertIdToObjectId(req.query.roleId) },
        { ...req.body },
        { new: true }
      );
      return createResponse(update, 200, "Role Details Updated successfully.", res);
    }
    else {
      const { roleName } = req.body;

      if (req.body.permissions && req.body.permissions.length > 0) {
        req.body.permissions.map((x) => {
          x.menuId = convertIdToObjectId(x.menuId);
        })
      }

      const findRole = await RestaurantRoleModel.findOne({ roleName: roleName, isDeleted: false, restaurantId: restaurantId });
      if (findRole) {
        throw new CustomError("Role already exists!", 400);
      }

      if (!!req?.restaurant?._id) {
        req.body.restaurantId = restaurantId
      }

      const newRoleCreated = await RestaurantRoleModel.create(req?.body);
      return createResponse(newRoleCreated, 200, "Role created successfully.", res);
    }

  } catch (error) {
    errorHandler(error, req, res);
  }
};


restaurantRoleController.roleList = async (req, res, next) => {
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
        $project: commonFilter.restaurantRoleObject
      }
    ] : [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $project: commonFilter.restaurantRoleObject
      }
    ]

    const roles = await RestaurantRoleModel.aggregate(query);

    createResponse(roles, 200, "Roles retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

restaurantRoleController.toggleRoleStatus = async (req, res, next) => {
  try {
    const { id } = req?.query;

    if (!id) {
      throw new CustomError("RoleID is required!", 404);
    }
    const Role = await RestaurantRoleModel.findById(id);

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


restaurantRoleController.getRoleById = async (req, res) => {
  try {
    const { id } = req?.params;
    const role = await RestaurantRoleModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.restaurantRoleObject
      }
    ]);
    createResponse(role?.length > 0 ? role[0] : [], 200, "Role retrieved Successfully.", res);
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
}

restaurantRoleController.roleDelete = async (req, res, next) => {
  try {
    const { id } = req?.body;

    const Role = await RestaurantRoleModel.findById(id);
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

module.exports = { restaurantRoleController }
