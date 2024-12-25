const { CustomError1, errorHandler1 } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const addToCartModel = require("../../models/addToCartModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");


exports.AddToCart = async (req, res) => {
    try {
        const { restaurantId, itemId, quantity } = req.body;
        if (!req?.cashier?._id) {
            throw new CustomError1(400, "cashier not found");
        }
        let userId = convertIdToObjectId(req?.cashier?._id)

        let cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        if (cart) {
            const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemId);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    itemId: convertIdToObjectId(itemId),
                    quantity,
                });
            }
            await cart.save();
        } else {
            await addToCartModel.create({
                userId: convertIdToObjectId(userId),
                restaurantId: convertIdToObjectId(restaurantId),
                items: [
                    {
                        itemId: convertIdToObjectId(itemId),
                        quantity,
                    },
                ],
                isDeleted: false,
            });
        }

        createResponse(null, 200, "Item added to cart successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};



exports.UpdateQuantity = async (req, res) => {
    try {
        const { restaurantId, itemId, quantity } = req.body;
        if (!req?.cashier?._id) {
            throw new CustomError1(400, "cashier not found");
        }
        let userId = convertIdToObjectId(req?.cashier?._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        if (!cart) {
            throw new CustomError1(404, "Cart not found.");
        }

        const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
        } else {
            throw new CustomError1(404, "Item not found in cart.");
        }

        createResponse(cart, 200, "Cart quantity updated successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};

exports.incrementDecrement = async (req, res) => {
    try {
        const { restaurantId, itemId, operation } = req.body;
        if (!req?.cashier?._id) {
            throw new CustomError1(400, "cashier not found");
        }
        let userId = convertIdToObjectId(req?.cashier?._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            "items.itemId": convertIdToObjectId(itemId),
        });

        if (!cart) {
            throw new CustomError1(404, "Cart or item not found.");
        }

        const updatedCart = await addToCartModel.findOneAndUpdate(
            {
                userId: userId,
                restaurantId: convertIdToObjectId(restaurantId),
                "items.itemId": convertIdToObjectId(itemId),
            },
            {
                $inc: {
                    "items.$.quantity": operation === "increment" ? 1 : -1,
                },
            },
            { new: true }
        );

        const item = updatedCart.items.find((i) => i.itemId.equals(itemId));
        if (item && item.quantity <= 0) {
            await addToCartModel.findOneAndUpdate(
                {
                    userId: userId,
                    restaurantId: convertIdToObjectId(restaurantId),
                },
                {
                    $pull: { items: { itemId: convertIdToObjectId(itemId) } },
                },
                { new: true }
            );
            return createResponse(null, 200, "Item removed from cart.", res);
        }

        createResponse(updatedCart, 200, "Cart quantity updated successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};



exports.RemoveItem = async (req, res) => {
    try {
        const { restaurantId, itemId } = req.body;
        if (!req?.cashier?._id) {
            throw new CustomError1(400, "cashier not found");
        }
        let userId = convertIdToObjectId(req?.cashier?._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        if (!cart) {
            throw new CustomError1(404, "Cart not found.");
        }

        const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemId);

        if (itemIndex > -1) {
            cart.items.pull(cart.items[itemIndex]);
            await cart.save();
        } else {
            throw new CustomError1(404, "Item not found in cart.");
        }

        createResponse(null, 200, "Item removed from cart successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};



exports.GetCartItems = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        if (!req?.cashier?._id) {
            throw new CustomError1(400, "cashier not found");
        }
        let userId = convertIdToObjectId(req?.cashier?._id);

        const cart = await addToCartModel.aggregate([
            {
                $match: {
                    userId: userId,
                    restaurantId: convertIdToObjectId(restaurantId),
                    isDeleted: false,
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "items",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "itemDetails",
                },
            },
            { $unwind: "$itemDetails" },
            {
                $project: {
                    itemId: "$items.itemId",
                    name: "$itemDetails.name",
                    quantity: "$items.quantity",
                    price: "$itemDetails.price",
                    totalPrice: { $multiply: ["$items.quantity", "$itemDetails.price"] },
                },
            },
        ]);

        const grandTotal = cart.reduce((total, item) => total + item.totalPrice, 0);

        createResponse({ userId, restaurantId, items: cart, grandTotal }, 200, "Cart items retrieved successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};





