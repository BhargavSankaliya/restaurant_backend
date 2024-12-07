const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const MasterMenu = require("../../models/masterMenuModel.js");
const menuMasterController = {};


menuMasterController.menuCreateUpdate = async (req, res, next) => {
  try {

    if (req.query.menuId) {

      let update = await MasterMenu.findOneAndUpdate(
        { _id: convertIdToObjectId(req.query.menuId) },
        { ...req.body },
        { new: true }
      );
      return createResponse(null, 200, "Menu Details Updated successfully.", res);
    }
    else {
      const newRoleCreated = await MasterMenu.create(req.body);
      return createResponse(null, 200, "Menu created successfully.", res);
    }

  } catch (error) {
    errorHandler(error, req, res);
  }
};


menuMasterController.menuList = async (req, res, next) => {
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
        $project: commonFilter.menuMasterObject
      }
    ] : [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $project: commonFilter.menuMasterObject
      }
    ]

    const menus = await MasterMenu.aggregate(query);

    createResponse(menus, 200, "Menus retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

menuMasterController.updateMenuStatus = async (req, res, next) => {
  try {
    const { id } = req?.query;

    if (!id) {
      throw new CustomError("Menu Id is required!", 404);
    }
    const Menu = await MasterMenu.findById(id);

    if (Menu.status == 'Active') {
      Menu.status = 'Inactive'
    }
    else {
      Menu.status = 'Active'
    }

    await Menu.save();

    createResponse(null, 200, `Menu ${Menu.status}d successfully.`, res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

menuMasterController.getMenuById = async (req, res, next) => {
  try {
    const { id } = req?.params;

    const Menu = await MasterMenu.findById(id);
    if (!Menu) {
      throw new CustomError("Menu not found!", 404);
    }

    createResponse(Menu, 200, "Menu retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { menuMasterController }
