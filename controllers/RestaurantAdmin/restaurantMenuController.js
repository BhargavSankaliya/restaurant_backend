const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantMenu = require("../../models/restaurantMenuModel.js");
const restaurantMenuController = {};


restaurantMenuController.menuCreateUpdate = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req?.restaurant?._id)
    if (req.query.menuId) {

      let update = await RestaurantMenu.findOneAndUpdate(
        { _id: convertIdToObjectId(req.query.menuId) },
        { ...req.body },
        { new: true }
      );
      return createResponse(null, 200, "Menu Details Updated successfully.", res);
    }
    else {
      if (!!req?.restaurant?._id) {
        req.body.restaurantId = restaurantId
      }
      const newMenuCreated = await RestaurantMenu.create(req.body);
      return createResponse(newMenuCreated, 200, "Menu created successfully.", res);
    }

  } catch (error) {
    errorHandler(error, req, res);
  }
};


restaurantMenuController.menuList = async (req, res, next) => {
  try {
    const { status } = req?.query;

    let query = !!status ? [
      {
        $match: {
          restaurantId : convertIdToObjectId(req.restaurant._id),
          status: status,
          isDeleted: false
        }
      },
      {
        $project: commonFilter.restaurantMenuObject
      }
    ] : [
      {
        $match: {
          restaurantId : convertIdToObjectId(req.restaurant._id),
          isDeleted: false
        }
      },
      {
        $project: commonFilter.restaurantMenuObject
      }
    ]

    const menus = await RestaurantMenu.aggregate(query);

    createResponse(menus, 200, "Menus retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

restaurantMenuController.updateMenuStatus = async (req, res, next) => {
  try {
    const { id } = req?.query;

    if (!id) {
      throw new CustomError("Menu Id is required!", 404);
    }
    const Menu = await RestaurantMenu.findById(id);

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

restaurantMenuController.getMenuById = async (req, res, next) => {
  try {
    const { id } = req?.params;

    const Menu = await RestaurantMenu.findById(id);
    if (!Menu) {
      throw new CustomError("Menu not found!", 404);
    }

    createResponse(Menu, 200, "Menu retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { restaurantMenuController }
