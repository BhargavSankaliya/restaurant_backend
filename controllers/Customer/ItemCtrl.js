const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const ItemModel = require("../../models/itemsModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");


exports.List = async (req, res) => {
    try {
        let { search } = req.query
        let matchObj = {}
        matchObj.isDeleted = false
        matchObj.categoryId = convertIdToObjectId(req.params.categoryId)
        matchObj.status = "Active"
        if (search) {
            matchObj.name = { $regex: search, $options: "i" }
        }
        const result = await ItemModel.aggregate([
            {
                $match: matchObj
            },

            {
                $unwind: {
                    path: "$choices",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "items",
                    localField: "choices.items",
                    foreignField: "_id",
                    as: "choices.itemList",
                    pipeline: [
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    description: {
                        $first: "$description"
                    },
                    price: {
                        $first: "$price"
                    },
                    image: {
                        $first: "$image"
                    },
                    spiceLevel: {
                        $first: "$spiceLevel"
                    },
                    options: {
                        $first: "$options"
                    },
                    choices: {
                        $push: "$choices"
                    }
                }
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
                    image: 1,
                    description: 1,
                    price: 1,
                    choices: 1,
                    options: 1,
                }
            },
        ]);
        createResponse(result, 200, "Items retrive Successfully.", res);
    } catch (error) {
        console.log(error);

        errorHandler(error, req, res);
    }
}
