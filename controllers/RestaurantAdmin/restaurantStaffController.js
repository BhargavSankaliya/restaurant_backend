const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantStaffModel = require("../../models/restaurantStaffModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const LoginVerificationModel = require("../../models/loginVerification.js")
const { default: mongoose, Error } = require("mongoose");
const otpHelper = require("../../helper/otpHelper.js")
const niv = require("node-input-validator");
const Helper = require("../../helper/helper.js")

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
    console.log("error", error)
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
        $project: commonFilter.staffMasterObj
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
    let { limit, page } = req?.query;
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
        $project: commonFilter.staffMasterObj
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

restaurantStaffController.activeList = async (req, res) => {
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
    matchObj.status = "Active"
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
        $project: commonFilter.staffMasterObj
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

restaurantStaffController.addDocument = async (req, res, next) => {
  try {
    const { id } = req?.query;
    const { name, url } = req?.body;

    if (!id || !name || !Array.isArray(url)) {
      throw new CustomError("Invalid input! Please provide all required fields.", 400);
    }

    const newDocument = {
      _id: new mongoose.Types.ObjectId(),
      name,
      url,
      createdAt: new Date(),
    };

    const staff = await RestaurantStaffModel.findOneAndUpdate(
      { _id: id },
      { $push: { documents: newDocument } },
      { new: true }
    );

    if (!staff) {
      throw new CustomError("Staff document  could not be updated!", 400);
    }

    createResponse(staff, 200, "Document added successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
    console.log("error", error)
  }
};

restaurantStaffController.documentList = async (req, res) => {
  try {
    const { id } = req?.params;
    const Cuisines = await RestaurantStaffModel.aggregate([
      {
        $match: { _id: convertIdToObjectId(id) }
      },
      {
        $project: {
          _id: 1,
          documents: 1
        }
      }
    ]);
    createResponse(Cuisines?.length > 0 ? Cuisines[0] : [], 200, "Staff found Successfully.", res);
  } catch (error) {
    console.log(error);

    errorHandler(error, req, res);
  }
}

restaurantStaffController.deleteDocument = async (req, res, next) => {
  try {
    const { staffId, documentId } = req?.query;

    if (!staffId || !documentId) {
      throw new CustomError("Invalid input! Please provide both staffId and documentId.", 400);
    }

    const staff = await RestaurantStaffModel.findOneAndUpdate(
      { _id: convertIdToObjectId(staffId) },
      { $pull: { documents: { _id: convertIdToObjectId(documentId) } } },
      { new: true }
    );

    if (!staff) {
      throw new CustomError("Staff document could not be deleted or does not exist!", 400);
    }

    createResponse(null, 200, "Document deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
    console.log("error", error);
  }
};

restaurantStaffController.forgotPassword = async (req, res) => {
  try {
    const { email, } = req.body

    const objValidation = new niv.Validator(req.body, {
      email: "required|email",
    });
    const matched = await objValidation.check();
    if (!matched) {
      return res
        .status(422)
        .send({ message: "Validation error", errors: objValidation.errors });
    }

    const restaurant = await RestaurantStaffModel.findOne({ email: email });
    if (!restaurant || restaurant?.status != "Active" || restaurant?.isDeleted == true) {
      throw new CustomError("RestaurantStaff not found!", 404);
    }
    try {
      const otp = await Helper.generateRandomString(6, true)

      let checkEmail = await LoginVerificationModel.findOne({ email: email });
      if (checkEmail) { await LoginVerificationModel.findByIdAndUpdate(checkEmail._id, { $set: { otp: otp } }); }
      else { await LoginVerificationModel({ email: email, otp: otp, }).save(); }

      // await otpHelper.sendOTPEmail(email, otp, req, res)

      createResponse({}, 200, "OTP sent successfully", res);
    } catch (error) {
      console.log("Error", error)
      throw new CustomError("Error in sending email", 400);
    }

  } catch (error) {
    console.log("Error", error)
    errorHandler(error, req, res);
  }
}

restaurantStaffController.verifyOTP = async (req, res) => {
  try {
    const { email, otp, } = req.body;
    const ObjValidation = new niv.Validator(req.body, {
      email: "required|email",
      otp: "required",
    });
    const matched = await ObjValidation.check();
    if (!matched) {
      return res.status(422).json({
        message: "validation error",
        error: ObjValidation.errors,
      });
    }

    const checkOTP = await LoginVerificationModel.findOne({
      email: email,
    });
    if (checkOTP?.otp !== Number(otp)) {
      throw new CustomError("Invalid OTP", 400);
    }
    createResponse({}, 200, "OTP verifiy successfully", res);

  } catch (error) {
    errorHandler(error, req, res);

  }
}

restaurantStaffController.resetPin = async (req, res) => {
  try {
    let { email, otp, pin } = req.body;
    const ObjValidation = new niv.Validator(req.body, {
      email: "required|email",
      otp: "required",
      pin: "required|minLength:4",
    });
    const matched = await ObjValidation.check();
    if (!matched) {
      return res.status(422).json({
        message: "validation error",
        error: ObjValidation.errors,
      });
    }
    const checkOTP = await LoginVerificationModel.findOne({
      email: email,
    });
    if (checkOTP?.otp !== Number(otp)) {
      throw new CustomError("Invalid OTP", 400);
    }
    await deleteOTP(email, otp);

    await RestaurantStaffModel.updateOne({ email: email }, { $set: { pin: pin } })
    createResponse({}, 200, "Pin updated successfully", res);

  } catch (error) {
    console.log("error", error)
    errorHandler(error, req, res);

  }
}

restaurantStaffController.changePin = async (req, res) => {
  try {
    let { pin, staffId } = req?.body;
    const ObjValidation = new niv.Validator(req?.body, {
      pin: "required|minLength:4",
    });
    const matched = await ObjValidation.check();
    if (!matched) {
      return res.status(422).json({
        message: "validation error",
        error: ObjValidation.errors,
      });
    }
    await RestaurantStaffModel.updateOne({ _id: convertIdToObjectId(staffId) }, { $set: { pin: pin } })
    createResponse({}, 200, "Pin updated successfully", res);

  } catch (error) {
    errorHandler(error, req, res);
    console.log("error", error)
  }
}

const deleteOTP = async (email, code) => {
  let deleteOTP = await LoginVerificationModel.findOneAndDelete({
    email: email,
    otp: code,
  });
  if (!deleteOTP) {
    console.log("Unable to delete OTP");
  }
  console.log("OTP deleted");
};


module.exports = { restaurantStaffController };
