const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const PosterModel = require("../../models/restaurantPosterModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");

exports.addEdit = async (req, res, next) => {
    try {
        let restaurantId = convertIdToObjectId(req.restaurant._id)
        if (req?.query?.id) {
            await PosterModel.findOneAndUpdate({ _id: convertIdToObjectId(req?.query?.id) }, { $set: req?.body })
            createResponse({}, 200, "Poster Updated Successfully.", res);
        } else {
            let { image } = req?.body;
            let createObj = { ...req.body, restaurantId }
            let result = await PosterModel.create(
                createObj
            );
            createResponse(result, 200, "Poster added Successfully.", res);
        }
    } catch (error) {
        
        errorHandler(error, req, res)
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req?.params;
        console.log(id);
        
        const result = await PosterModel.findOne({ _id: convertIdToObjectId(id) });
        if (!result) {
            throw new CustomError("Poster not found!", 404);
        }
        createResponse(result, 200, "Poster found Successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
}

exports.list = async (req, res) => {
    try {
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.restaurantId = convertIdToObjectId(req.restaurant._id)
        const result = await PosterModel.aggregate([
            {
                $match: matchObj
            },
            {
                $sort: {
                    createdAt: -1
                }
            },

        ]);
        createResponse(result, 200, "Poster retrive Successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.toggleStatus = async (req, res) => {
    try {
        let id = convertIdToObjectId(req?.params?.id)
        let poster = await PosterModel.findById(id)
        if (!poster) {
            throw new CustomError("poster not found", 404);
        }
        await PosterModel.findByIdAndUpdate(id, { $set: { status: poster.status == "Active" ? "Inactive" : "Active" } })
        createResponse({}, 200, "Poster status updated successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}

exports.delete = async (req, res) => {
    try {
        let id = convertIdToObjectId(req?.params?.id)
        let poster = await PosterModel.findById(id)
        if (!poster) {
            throw new CustomError("Poster not found", 404);
        }
        await PosterModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
        createResponse({}, 200, "Poster deleted successfully.", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}



