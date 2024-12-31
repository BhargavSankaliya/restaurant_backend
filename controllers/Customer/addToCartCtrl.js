const { CustomError1, errorHandler1 } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const addToCartModel = require("../../models/addToCartModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");


exports.AddToCart = async (req, res) => {
    try {
        const { restaurantId, itemId, quantity, modifiers, choices, option } = req.body;
        const userId = convertIdToObjectId(req.customer._id);

        let cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        const newItem = {
            itemId: convertIdToObjectId(itemId),
            quantity,
            modifiers: modifiers ? modifiers.map((id) => convertIdToObjectId(id)) : [],
            choices: choices || [],
            option: option || [],
        };

        if (cart) {
            cart.items.push(newItem);
            await cart.save();
        } else {
            await addToCartModel.create({
                userId: userId,
                restaurantId: convertIdToObjectId(restaurantId),
                items: [newItem],
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
        const { restaurantId, _id, quantity, modifiers, choices, option, itemId } = req.body;
        let userId = convertIdToObjectId(req.customer._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        if (!cart) {
            throw new CustomError1(404, "Cart not found.");
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() == _id);

        if (itemIndex > -1) {
            if (itemId) {
                cart.items[itemIndex].itemId = convertIdToObjectId(itemId);
            }
            if (quantity !== undefined) {
                cart.items[itemIndex].quantity = quantity;
            }
            if (modifiers) {
                cart.items[itemIndex].modifiers = modifiers.map(modifierId => convertIdToObjectId(modifierId));
            }
            if (choices) {
                cart.items[itemIndex].choices = choices;
            }
            if (option) {
                cart.items[itemIndex].option = option.map(opt => ({
                    ...opt,
                    _id: opt._id ? convertIdToObjectId(opt._id) : undefined,
                }));
            }

            await cart.save();
        } else {
            throw new CustomError1(404, "Item not found in cart.");
        }

        createResponse(cart, 200, "Cart item updated successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};

exports.GetCartItems = async (req, res) => {
    try {
        let userId = convertIdToObjectId(req.customer._id);

        const cart = await addToCartModel.aggregate([
            {
                $match: {
                    userId: userId,
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
                $lookup: {
                    from: "modifiers",
                    localField: "items.modifiers",
                    foreignField: "_id",
                    as: "modifierDetails",
                },
            },
            {
                $project: {
                    _id: 1,
                    itemUniqueId: "$items._id",
                    itemId: "$items.itemId",
                    quantity: "$items.quantity",
                    itemDetails: "$itemDetails",
                    totalPrice: { $multiply: ["$items.quantity", "$itemDetails.price"] },
                    choices: "$items.choices",
                    modifiers: "$modifierDetails",
                    option: "$items.option",
                },
            },
        ]);

        const items = cart.map((item) => ({
            _id: item._id,
            itemUniqueId: item.itemUniqueId,
            itemId: item.itemId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            choices: item.choices,
            modifiers: item.modifiers.map((modifier) => ({
                id: modifier._id,
                additionalItemName: modifier.additionalItemName,
                description: modifier.description,
                restaurantId: modifier.restaurantId,
                price: modifier.price,
            })),
            itemDetails: {
                id: item.itemDetails._id,
                name: item.itemDetails.name,
                description: item.itemDetails.description,
                image: item.itemDetails.image,
                price: item.itemDetails.price,
                spiceLevel: item.itemDetails.spiceLevel,
                status: item.itemDetails.status,
                options: item.itemDetails.options,
                choices: item.itemDetails.choices,
            },
            option: item.option,
        }));

        const grandTotal = items.reduce((total, item) => total + item.totalPrice, 0);

        const response = {
            data: {
                userId: req.customer._id,
                items: items,
                grandTotal: grandTotal,
            },
            meta: {
                code: 200,
                success: true,
                message: "Cart items retrieved successfully.",
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};


exports.incrementDecrement = async (req, res) => {
    try {
        const { restaurantId, _id, itemUniqueId, operation } = req.body;
        const userId = convertIdToObjectId(req.customer._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            _id: convertIdToObjectId(_id),
            "items._id": convertIdToObjectId(itemUniqueId),
        });

        if (!cart) {
            throw new CustomError1(404, "Cart or item not found.");
        }

        const updatedCart = await addToCartModel.findOneAndUpdate(
            {
                userId: userId,
                restaurantId: convertIdToObjectId(restaurantId),
                _id: convertIdToObjectId(_id),
                "items._id": convertIdToObjectId(itemUniqueId),
            },
            {
                $inc: {
                    "items.$.quantity": operation === "increment" ? 1 : -1,
                },
            },
            { new: true }
        );

        const item = updatedCart.items.find(
            (i) => i._id.toString() === itemUniqueId
        );

        if (item && item.quantity <= 0) {
            const cartAfterRemoval = await addToCartModel.findOneAndUpdate(
                {
                    userId: userId,
                    restaurantId: convertIdToObjectId(restaurantId),
                },
                {
                    $pull: { items: { _id: convertIdToObjectId(itemUniqueId) } },
                },
                { new: true }
            );

            return createResponse(
                cartAfterRemoval,
                200,
                "Item removed from cart.",
                res
            );
        }

        createResponse(updatedCart, 200, "Cart quantity updated successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};

exports.RemoveItem = async (req, res) => {
    try {
        const { restaurantId, _id, itemUniqueId } = req.body;
        let userId = convertIdToObjectId(req.customer._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        if (!cart) {
            throw new CustomError1(404, "Cart not found.");
        }

        if (req.query.type == 'all') {
            await addToCartModel.deleteOne({ _id: cart._id })
            return createResponse(null, 200, "Item removed from cart successfully.", res);
        }

        const itemIndex = cart.items.findIndex(
            (item) =>
                item._id.toString() === itemUniqueId
        );

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);

            cart.grandTotal = cart.items.reduce(
                (total, item) => total + item.totalPrice,
                0
            );

            await cart.save();

            createResponse(null, 200, "Item removed from cart successfully.", res);
        } else {
            throw new CustomError1(404, "Item not found in cart.");
        }
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};










