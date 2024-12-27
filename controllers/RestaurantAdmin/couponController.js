const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const couponModel = require("../../models/couponModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

const couponController = {};

couponController.createCoupon = async (req, res, next) => {
  try {
    let restaurantId = convertIdToObjectId(req.restaurant._id)
    if (!req?.query?.id) {
      let { name } = req?.body;
      const findCoupon = await couponModel.findOne({ name, restaurantId, isDeleted: false, });
      if (findCoupon) {
        throw new CustomError("Coupon already exists!", 400);
      }
      let createObj = { ...req.body, restaurantId }
      let cuisineCoupon = await couponModel.create(createObj);
      createResponse(cuisineCoupon, 200, "Coupon Created Successfully.", res);
    } else {
      const { id } = req?.query;
      const existing = await couponModel.findOne({
        _id: { $ne: convertIdToObjectId(id) },
        restaurantId: restaurantId,
        isDeleted: false,
        name: req?.body?.name
      });
      if (existing) {
        throw new CustomError("Coupon already exists!", 400);
      }
      const Coupon = await couponModel.findOneAndUpdate(
        { _id: id },
        req?.body,
        { new: true }
      );
      if (!Coupon) {
        throw new CustomError("Coupon could not be edited!", 400);
      }
      createResponse(Coupon, 200, "Coupon Updated Successfully.", res);
    }
  } catch (error) {
    console.log("error", error)
    errorHandler(error, req, res);
  }
};

couponController.couponGetById = async (req, res) => {
  try {
    const { id } = req?.params;
    const coupon = await couponModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: commonFilter.couponMasterObj
      }
    ]);
    createResponse(coupon?.length > 0 ? coupon[0] : [], 200, "Coupon found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

couponController.couponList = async (req, res) => {
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
    const Coupon = await couponModel.aggregate([
      {
        $match: matchObj
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: commonFilter.couponMasterObj
      },
    ]);

    let result = Coupon
    createResponse(result, 200, "Coupon found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

couponController.toggleStatus = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let Coupon = await couponModel.findById(id)
    if (!Coupon) {
      throw new CustomError("Coupon not found", 404);
    }
    await couponModel.findByIdAndUpdate(id, { $set: { status: Coupon.status == "Active" ? "Inactive" : "Active" } })
    createResponse({}, 200, "Coupon status updated successfully.", res);

  } catch (error) {
    errorHandler(error, req, res);
  }
}

couponController.delete = async (req, res) => {
  try {
    let id = convertIdToObjectId(req?.params?.id)
    let CouponCheck = await couponModel.findById(id)
    if (!CouponCheck) {
      throw new CustomError("Coupon not found", 404);
    }
    await couponModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    createResponse({}, 200, "Coupon deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


couponController.dropDown = async (req, res) => {
  try {

    let restaurantId = convertIdToObjectId(req.restaurant._id)
    let result = await couponModel.find({ restaurantId: restaurantId, status: "Active", isDeleted: false }, { name: 1, _id: 1 })
    createResponse(result, 200, "Success", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
}


module.exports = { couponController };
