const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantTableModel = require("../../models/restaurantTableModel.js");
const Helper = require("../../helper/helper.js")


exports.createUpdate = async (req, res, next) => {
    try {
        let restaurantId = convertIdToObjectId(req.restaurant._id)
        if (req?.query?.id) {
            const { id } = req?.query;
            let body = { ...req.body, restaurantId }
            const existing = await RestaurantTableModel.findOne({
                _id: { $ne: convertIdToObjectId(id) },
                restaurantId: restaurantId,
                $or: [
                    { name: body.name },
                    { tableNumber: body.tableNumber }
                ],
            })
            if (existing) {
                throw new CustomError("Table already exist!", 400);
            }
            body.qrcode = await Helper.QRCodeGen(body, req.query.id)
            await RestaurantTableModel.findOneAndUpdate({ _id: convertIdToObjectId(id) }, { $set: body })

            createResponse({}, 200, "Table Updated Successfully.", res);
        } else {
            let body = { ...req.body, restaurantId }
            const existing = await RestaurantTableModel.findOne({
                restaurantId: restaurantId,
                $or: [
                    { name: body.name },
                    { tableNumber: body.tableNumber }
                ],
            })
            if (existing) {
                throw new CustomError("Table already exist!", 400);
            }

            let result = await RestaurantTableModel.create(
                body
            );

            let getTable = await RestaurantTableModel.findById(result._id);

            getTable.qrcode = await Helper.QRCodeGen(result);
            getTable.save();

            createResponse(result, 200, "Table Created Successfully.", res);

        }
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res)
    }
}


exports.list = async (req, res, next) => {
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
        const data = await RestaurantTableModel.aggregate([
            {
                $match: matchObj
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: commonFilter.reastaurantTable
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
        createResponse(result, 200, "Category found Successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
};

exports.toggleStatus = async (req, res, next) => {
    try {
        let id = convertIdToObjectId(req.params.id)
        const table = await RestaurantTableModel.findById(id);
        if (!table) {
            throw new CustomError("Table not found!", 404);
        }
        await RestaurantTableModel.updateOne({ _id: id }, { $set: { status: table.status == "Active" ? "Inactive" : "Active" } })
        createResponse({}, 200, "Table status updated successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.getItemById = async (req, res, next) => {
    try {
        let id = convertIdToObjectId(req.params.id)
        const table = await RestaurantTableModel.findOne({ _id: id }, { _id: 1, name: 1, tableNumber: 1, capacity: 1, status: 1, openTime: 1, qrcode: 1 });
        if (!table) {
            throw new CustomError("Table not found!", 404);
        }
        createResponse(table, 200, "Table retrieved successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.delete = async (req, res, next) => {
    try {
        let id = convertIdToObjectId(req.params.id)
        const table = await RestaurantTableModel.findById(id);
        if (!table) {
            throw new CustomError("Table not found!", 404);
        }
        await RestaurantTableModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
        createResponse({}, 200, "Table deleted successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
};
