const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantStaffModel = require("../../models/restaurantStaffModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const restaurantStaffController = {};

restaurantStaffController.createStaff = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {

      let { email } = req?.body;
      const findStaff = await RestaurantStaffModel.findOne({ email, restaurantId });
      if (findStaff) {
        throw new CustomError("Staff already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let staffCreated = await RestaurantStaffModel.create(createObj);
      createResponse(staffCreated, 200, "Staff Created Successfully.", res);

    } else {

      const { id } = req?.query;
      const existing = await RestaurantStaffModel.findOne({
        _id: { $ne: convertIdToObjectId(id) },
        restaurantId: restaurantId,
        email: req?.body?.email
      });
      if (existing) {
        throw new CustomError("Staff already exists!", 400);
      }
      const staff = await RestaurantStaffModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!staff) {
        throw new CustomError("Staff could not be edited!", 400);
      }
      createResponse(staff, 200, "Staff Updated Successfully.", res);

    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

restaurantStaffController.staffGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Cuisines = await RestaurantStaffModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.cuisinesMasterObj
      }
    ]);
    createResponse(Cuisines?.length > 0 ? Cuisines[0] : [], 200, "Staff found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

restaurantStaffController.staffList = async (req, res) => {
  try {
    let { status, limit, page } = req?.query;
    let matchObj = {}
    matchObj.isDeleted = false
    if (!limit) {
      limit = 10
    }
    if (!page) {
      page = 1
    }
    let skip = (Number(page) - 1) * Number(limit)
    if (status) {
      matchObj.status = status
    }
    const Cuisines = await RestaurantStaffModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.cuisinesMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Cuisines,
      pagination: await commonFilter.paginationCalculation(Cuisines, limit, page)
    }
    createResponse(result, 200, "Staff found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

restaurantStaffController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Cuisine = await RestaurantStaffModel.findById(id)
    if (!Cuisine) {
      throw new CustomError("Staff not found", 404);
    }
    await RestaurantStaffModel.findByIdAndUpdate(id, { $set: { status: Cuisine.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Staff status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

restaurantStaffController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let CuisineCheck = await RestaurantStaffModel.findById(id)
    if (!CuisineCheck) {
      throw new CustomError("Staff not found", 404);
    }
    await RestaurantStaffModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Staff deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


restaurantStaffController.dropDown = async (req, res) => {
  try {

    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await RestaurantStaffModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { restaurantStaffController };
