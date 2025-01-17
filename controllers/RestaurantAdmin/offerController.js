const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const OfferModel = require("../../models/offerModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const offerController = {};

offerController.createOffer = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name } = req?.body;
      const findOffer = await OfferModel.findOne({ name, restaurantId, isDeleted: false, });
      if (findOffer) {
        throw new CustomError("Offer already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let OfferCoupon = await OfferModel.create(createObj);
      createResponse(OfferCoupon, 200, "Offer Created Successfully.", res);
    } else {
      const { id } = req?.query;
      const existing = await OfferModel.findOne({
        _id: { $ne: convertIdToObjectId(id) },
        restaurantId: restaurantId,
        isDeleted: false,
        name: req?.body?.name
      });
      if (existing) {
        throw new CustomError("Offer already exists!", 400);
      }
      const Offer = await OfferModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!Offer) {
        throw new CustomError("Offer could not be edited!", 400);
      }
      createResponse(Offer, 200, "Offer Updated Successfully.", res);
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

offerController.OfferGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const Offer = await OfferModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.OfferMasterObj
      }
    ]);
    createResponse(Offer?.length > 0 ? Offer[0] : [], 200, "Offer found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

offerController.OfferList = async (req, res) => {
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
    const Offer = await OfferModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.OfferMasterObj
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit)
      }
    ]);
    let result = {
      data: Offer,
      pagination: await commonFilter.paginationCalculation(Offer, limit, page)
    }
    createResponse(result, 200, "Offer found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

offerController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Offer = await OfferModel.findById(id)
    if (!Offer) {
      throw new CustomError("Offer not found", 404);
    }
    await OfferModel.findByIdAndUpdate(id, { $set: { status: Offer.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Offer status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

offerController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let OfferCheck = await OfferModel.findById(id)
    if (!OfferCheck) {
      throw new CustomError("Offer not found", 404);
    }
    await OfferModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Offer deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


offerController.dropDown = async (req, res) => {
  try {

    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await OfferModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { offerController };
