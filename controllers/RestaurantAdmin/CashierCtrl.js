const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const CashierModel = require("../../models/CashierModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const Helper = require("../../helper/helper.js")

exports.createUpdate = async (req, res) => {
    try {
        let restaurantId = req.restaurant._id
        let body = { ...req.body, restaurantId }
        if (req?.query?.cashierId) {
            let emailCheck = await CashierModel.findOne({ _id: { $ne: convertIdToObjectId(req?.query?.cashierId), }, email: body.email, isDeleted: false })

            if (emailCheck) {
                throw new CustomError("Email already exists!", 400);
            }
            if (body.password) {
                body.password = await Helper.bcyptPass(body.password)
            }
            await CashierModel.findByIdAndUpdate(req?.query?.cashierId, { $set: body })
            createResponse({}, 200, "Cashier updated successfully.", res);
        } else {
            let emailCheck = await CashierModel.findOne({ email: body.email, isDeleted: false })
            if (emailCheck) {
                throw new CustomError("Email already exists!", 400);
            }
            body.password = await Helper.bcyptPass(body.password)
            await CashierModel(body).save()
            createResponse({}, 200, "Cashier created successfully.", res);
        }

    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.list = async (req, res) => {
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
        const data = await CashierModel.aggregate([
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
                    _id: 1,
                    name: 1,
                    email: 1,
                    image:1,
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
        createResponse(result, 200, "Cashier  retrive Successfully.", res);

    } catch (error) {
        errorHandler(error, req, res);

    }
}


exports.getById = async (req, res) => {
    try {
        let result = await CashierModel.findOne({ _id: convertIdToObjectId(req.params.id    ), restaurantId: convertIdToObjectId(req.restaurant._id), isDeleted: false }, { name: 1, status: 1, email: 1 ,image:1})
        if (!result) {
            throw new CustomError("Cashier not found!", 404);
        }
        createResponse(result, 200, "Cashier retrive successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.toggleStatus = async (req, res) => {
    try {
        let data = await CashierModel.findOne({ _id: convertIdToObjectId(req.params.id), restaurantId: convertIdToObjectId(req.restaurant._id), isDeleted: false }, { name: 1, status: 1, email: 1 })
        if (!data) {
            throw new CustomError("Cashier not found!", 404);
        }
        await CashierModel.findByIdAndUpdate(convertIdToObjectId(req.params.id), { $set: { status: data.status == "Active" ? "Inactive" : "Active" } })
        createResponse({}, 200, "Cashier status updated successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.delete = async (req, res) => {
    try {
        let data = await CashierModel.findOne({ _id: convertIdToObjectId(req.params.id), restaurantId: convertIdToObjectId(req.restaurant._id), isDeleted: false }, { name: 1, status: 1, email: 1 })
        if (!data) {
            throw new CustomError("Cashier not found!", 404);
        }
        await CashierModel.findByIdAndUpdate(convertIdToObjectId(req.params.id), { $set: { isDeleted: true } })
        createResponse({}, 200, "Cashier deleted successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}