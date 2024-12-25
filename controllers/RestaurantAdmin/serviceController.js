const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ServiceModel = require("../../models/serviceModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const serviceController = {};

serviceController.createService = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name } = req?.body;
      const findService = await ServiceModel.findOne({ name, restaurantId, isDeleted: false });
      if (findService) {
        throw new CustomError("Service already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let serviceCreated = await ServiceModel.create(createObj);
      createResponse(serviceCreated, 200, "Service Created Successfully.", res);
    } else {
      const { id } = req?.query;
      const existing = await ServiceModel.findOne({
        _id: { $ne: convertIdToObjectId(id) },
        restaurantId: restaurantId,
        name: req?.body?.name,
        isDeleted: false
      });
      if (existing) {
        throw new CustomError("Service already exists!", 400);
      }
      const service = await ServiceModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!service) {
        throw new CustomError("Service could not be edited!", 400);
      }
      createResponse(service, 200, "Service Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

serviceController.serviceGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Service = await ServiceModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.serviceMasterObj
      }
    ]);
    createResponse(Service?.length > 0 ? Service[0] : [], 200, "Service found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

serviceController.serviceList = async (req, res) => {
  try {
    let { status, limit, page } = req?.query;
    let matchObj = {}
    matchObj.isDeleted = false
    matchObj.restaurantId = convertIdToObjectId(req.restaurant._id)
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
    const Service = await ServiceModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.serviceMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Service,
      pagination: await commonFilter.paginationCalculation(Service, limit, page)
    }
    createResponse(result, 200, "Service found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

serviceController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Service = await ServiceModel.findById(id)
    if (!Service) {
      throw new CustomError("Service not found", 404);
    }
    await ServiceModel.findByIdAndUpdate(id, { $set: { status: Service.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Service status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

serviceController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let ServiceCheck = await ServiceModel.findById(id)
    if (!ServiceCheck) {
      throw new CustomError("Service not found", 404);
    }
    await ServiceModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Service deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


serviceController.dropDown = async (req, res) => {
  try {

    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await ServiceModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { serviceController };
