const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const PaymentMethodModel = require("../../models/paymentMethodModel.js");
const { commonFilter, convertIdToObjectId } = require("../../middlewares/commonFilter.js")


exports.createUpdate = async (req, res, next) => {
    try {
        let restaurantId = convertIdToObjectId(req.restaurant._id)
        let body = { ...req.body, restaurantId };

        if (req?.query?.paymentMethodId) {
            let id = convertIdToObjectId(req?.query?.paymentMethodId)
            let paymentMethodCheck = await PaymentMethodModel.findOne({ _id: { $ne: id }, isDeleted: false, restaurantId: restaurantId, name: body.name })

            if (paymentMethodCheck) {
                throw new CustomError("Payment method already exists", 400);
            }
            let result = await PaymentMethodModel.findByIdAndUpdate(id, { $set: body })
            createResponse(result, 200, "Payment method updated successfully.", res);
        } else {
            const paymentMethodCheck = await PaymentMethodModel.findOne({ name: body.name, restaurantId: restaurantId, isDeleted: false });
            if (paymentMethodCheck) {
                throw new CustomError("Payment method already exists", 400);
            }
            let result = await PaymentMethodModel(body).save()

            createResponse(result, 200, "Payment method created successfully.", res);
        }
    } catch (error) {
        errorHandler(error, req, res)
    }
}


exports.list = async (req, res, next) => {
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
        const data = await PaymentMethodModel.aggregate([
            {
                $match: matchObj
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    name: 1,
                    methodType: 1,
                    status: 1
                }
            },
            {
                $skip: Number(skip),
            },
            {
                $limit: Number(limit)
            }
        ]);
        let result = {
            data: data,
            pagination: await commonFilter.paginationCalculation(data, limit, page)
        }
        createResponse(result, 200, "Payment method retrive Successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
};

exports.toggleStatus = async (req, res, next) => {
    try {
        let paymentMethodId = convertIdToObjectId(req.params.id)
        const paymentMethodCheck = await PaymentMethodModel.findById(paymentMethodId);
        if (!paymentMethodCheck) {
            throw new CustomError("Payment method  not found!", 404);
        }
        await PaymentMethodModel.updateOne({ _id: paymentMethodId }, { $set: { status: paymentMethodCheck.status == "Active" ? "Inactive" : "Active" } })
        createResponse({}, 200, "Payment method status updated successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.getItemById = async (req, res, next) => {
    try {
        let paymentMethodId = convertIdToObjectId(req.params.id)
        const paymentMethodCheck = await PaymentMethodModel.findOne({ _id: paymentMethodId }, { _id: 1, name: 1,methodType:1,status:1 });
        if (!paymentMethodCheck) {
            throw new CustomError("Payment method not found!", 404);
        }
        createResponse(paymentMethodCheck, 200, "Payment method retrieved successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.delete = async (req, res, next) => {
    try {
        let paymentMethodId = convertIdToObjectId(req.params.id)
        const paymentMethodCheck = await PaymentMethodModel.findById(paymentMethodId);
        if (!paymentMethodCheck) {
            throw new CustomError("Payment method not found!", 404);
        }
        await PaymentMethodModel.findByIdAndUpdate(paymentMethodId, { $set: { isDeleted: true } })
        createResponse({}, 200, "Payment method deleted successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

