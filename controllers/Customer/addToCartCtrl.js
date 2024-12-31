const { CustomError1, errorHandler1, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const addToCartModel = require("../../models/addToCartModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const itemsModel = require("../../models/itemsModel.js");
const modifierModel = require("../../models/modifierModel.js");
const CouponModel = require("../../models/couponModel.js");


exports.AddToCart = async (req, res) => {
    try {
        const { restaurantId, itemId, quantity, modifiers, choices, option, coupons, notes } = req.body;
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
            notes
        };

        let paymentObject = {
            totalAmount: await calculatePrice(itemId, quantity, modifiers),
            discountAmount: 0,
            finalAmount: 0,
            tipAmount: 0,
            gst: 0,
        }

        paymentObject.gst = await calculateGST(paymentObject.totalAmount);

        paymentObject.finalAmount = paymentObject.totalAmount + paymentObject.gst + paymentObject.tipAmount;

        let discount = 0;

        if (coupons && coupons.length > 0) {
            for (const { couponId, couponCode } of coupons) {
                const coupon = await CouponModel.findOne({
                    _id: convertIdToObjectId(couponId),
                    code: couponCode,
                    status: "Active",
                    $or: [{ restaurantId: null }, { restaurantId: convertIdToObjectId(restaurantId) }],
                });

                if (!coupon) {
                    throw new CustomError1(400, "Invalid or inactive coupon.");
                }

                if (["datewise", "both"].includes(coupon.type)) {
                    const now = new Date();
                    if (coupon.start_date && coupon.end_date && (now < coupon.start_date || now > coupon.end_date)) {
                        throw new CustomError1(400, "Coupon has expired or is not yet active.");
                    }
                }

                if (["limit", "both"].includes(coupon.type) && coupon.limit <= 0) {
                    throw new CustomError1(400, "Coupon usage limit has been reached.");
                }

                if (coupon.min_order_value > 0 && totalAmount < coupon.min_order_value) {
                    throw new CustomError1(400, `Minimum order value for this coupon is ${coupon.min_order_value}.`);
                }

                const currentDiscount = Math.min(
                    (totalAmount * (coupon.discount_percentage / 100)),
                    coupon.max_discounted_amount > 0 ? coupon.max_discounted_amount : totalAmount
                );

                discount += currentDiscount;

                if (["limit", "both"].includes(coupon.type)) {
                    coupon.limit -= 1;
                    await coupon.save();
                }
            }

        }

        if (cart) {
            cart.payment = {
                totalAmount: cart.payment.totalAmount + paymentObject.totalAmount,
                discountAmount: cart.payment.discountAmount + paymentObject.discountAmount,
                finalAmount: cart.payment.finalAmount + paymentObject.finalAmount,
                tipAmount: cart.payment.tipAmount + paymentObject.tipAmount,
                gst: cart.payment.gst + paymentObject.gst,
            }

            cart.payment.gst = await calculateGST(cart.payment.totalAmount);

            cart.payment.finalAmount = cart.payment.totalAmount + cart.payment.gst + cart.payment.tipAmount;

            cart.payment.finalAmount = cart.payment.finalAmount - discount;

            cart.items.push(newItem);

            if (coupons && coupons.length > 0) {
                cart.coupons = coupons
            }

            await cart.save();
        } else {
            await addToCartModel.create({
                userId: userId,
                restaurantId: convertIdToObjectId(restaurantId),
                items: [newItem],
                isDeleted: false,
                payment: paymentObject,
                coupons
            });
        }

        createResponse(null, 200, "Item added to cart successfully.", res);
    } catch (error) {
        console.error(error);
        errorHandler1(error, req, res);
    }
};

const calculateGST = async (totalAmount) => {
    let gstPercentage = 5;

    let gstAmount = (totalAmount * gstPercentage) / 100;

    gstAmount = gstAmount.toFixed(2);

    gstAmount = parseFloat(gstAmount);

    return gstAmount;
}

const calculatePrice = async (itemId, quantity, modifiers) => {
    let itemIds = await itemsModel.findById(itemId);

    let itemTotalPrice = 0;

    itemTotalPrice = itemIds.price * quantity;

    if (modifiers && modifiers.length > 0) {
        let mPrice = 0;
        let modifiersList = modifiers.map(async (x) => {
            let details = await modifierModel.findById(x);
            mPrice = mPrice + (details.price * quantity);
        })

        await Promise.all(modifiersList);

        itemTotalPrice = mPrice + itemTotalPrice;
    }

    return itemTotalPrice;
}

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
                    notes: "$items.notes",
                    payment: 1,
                    coupons: 1,
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
            notes: item.notes,
            option: item.option,
        }));

        const grandTotal = items.reduce((total, item) => total + item.totalPrice, 0);

        const response = {
            data: {
                userId: req.customer._id,
                items: items,
                grandTotal: grandTotal,
                payment: cart && cart[0] ? cart[0].payment : null,
                coupons: cart && cart[0] ? cart[0].coupons : []
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
        const { restaurantId, itemUniqueId, operation } = req.body;
        const userId = convertIdToObjectId(req.customer._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            // _id: convertIdToObjectId(_id),
            "items._id": convertIdToObjectId(itemUniqueId),
        });

        if (!cart) {
            throw new CustomError1(404, "Cart or item not found.");
        }

        const updatedCart = await addToCartModel.findOneAndUpdate(
            {
                userId: userId,
                restaurantId: convertIdToObjectId(restaurantId),
                // _id: convertIdToObjectId(_id),
                "items._id": convertIdToObjectId(itemUniqueId),
            },
            {
                $inc: {
                    "items.$.quantity": operation === "increment" ? 1 : -1,
                },
            },
            { new: true }
        );

        // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        let paymentObject = {
            totalAmount: 0,
            discountAmount: 0,
            finalAmount: 0,
            tipAmount: 0,
            gst: 0,
        }

        let items = updatedCart.items.map(async (x) => {

            let calculateAmount = await calculatePrice(x.itemId, x.quantity, x.modifiers)

            paymentObject = {
                totalAmount: paymentObject.totalAmount + calculateAmount,
                discountAmount: 0,
                finalAmount: 0,
                tipAmount: 0,
                gst: 0,
            }
        })

        await Promise.all(items);

        paymentObject.gst = await calculateGST(paymentObject.totalAmount);
        paymentObject.finalAmount = paymentObject.totalAmount + paymentObject.gst + paymentObject.tipAmount;

        updatedCart.payment = paymentObject;

        updatedCart.payment.finalAmount = paymentObject.finalAmount - (updatedCart.payment.discount ? updatedCart.payment.discount : 0);
        // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        await updatedCart.save();
        // const item = updatedCart.items.find(
        //     (i) => i._id.toString() === itemUniqueId
        // );

        // if (item && item.quantity <= 0) {
        //     const cartAfterRemoval = await addToCartModel.findOneAndUpdate(
        //         {
        //             userId: userId,
        //             restaurantId: convertIdToObjectId(restaurantId),
        //         },
        //         {
        //             $pull: { items: { _id: convertIdToObjectId(itemUniqueId) } },
        //         },
        //         { new: true }
        //     );

        //     return createResponse(
        //         cartAfterRemoval,
        //         200,
        //         "Item removed from cart.",
        //         res
        //     );
        // }

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

            let paymentObject = {
                totalAmount: 0,
                discountAmount: 0,
                finalAmount: 0,
                tipAmount: 0,
                gst: 0,
            }

            let items = cart.items.map(async (x) => {

                let calculateAmount = await calculatePrice(x.itemId, x.quantity, x.modifiers)

                paymentObject = {
                    totalAmount: paymentObject.totalAmount + calculateAmount,
                    discountAmount: 0,
                    finalAmount: 0,
                    tipAmount: 0,
                    gst: 0,
                }
            })

            await Promise.all(items);

            paymentObject.gst = await calculateGST(paymentObject.totalAmount);
            paymentObject.finalAmount = paymentObject.totalAmount + paymentObject.gst + paymentObject.tipAmount;

            cart.payment = paymentObject;

            cart.payment.finalAmount = paymentObject.finalAmount - (cart.payment.discount ? cart.payment.discount : 0);


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


exports.addCouponinCart = async (req, res) => {
    try {

        const { restaurantId, coupons } = req.body;
        let userId = convertIdToObjectId(req.customer._id);

        const cart = await addToCartModel.findOne({
            userId: userId,
            restaurantId: convertIdToObjectId(restaurantId),
            isDeleted: false,
        });

        if (!cart) {
            throw new CustomError1(404, "Cart not found.");
        }
        let discount = 0;
        let paymentObject = {
            totalAmount: 0,
            discountAmount: 0,
            finalAmount: 0,
            tipAmount: 0,
            gst: 0,
        }

        let items = cart.items.map(async (x) => {

            let calculateAmount = await calculatePrice(x.itemId, x.quantity, x.modifiers)

            paymentObject = {
                totalAmount: paymentObject.totalAmount + calculateAmount,
                discountAmount: 0,
                finalAmount: 0,
                tipAmount: 0,
                gst: 0,
            }
        })

        await Promise.all(items);

        paymentObject.gst = await calculateGST(paymentObject.totalAmount);
        paymentObject.finalAmount = paymentObject.totalAmount + paymentObject.gst + paymentObject.tipAmount;

        if (coupons && coupons.length > 0) {
            for (const { couponId, couponCode } of coupons) {
                const coupon = await CouponModel.findOne({
                    _id: convertIdToObjectId(couponId),
                    code: couponCode,
                    status: "Active",
                    $or: [{ restaurantId: null }, { restaurantId: convertIdToObjectId(restaurantId) }],
                });

                if (!coupon) {
                    throw new CustomError1(400, "Invalid or inactive coupon.");
                }

                if (["datewise", "both"].includes(coupon.type)) {
                    const now = new Date();
                    if (coupon.start_date && coupon.end_date && (now < coupon.start_date || now > coupon.end_date)) {
                        throw new CustomError1(400, "Coupon has expired or is not yet active.");
                    }
                }

                if (["limit", "both"].includes(coupon.type) && coupon.limit <= 0) {
                    throw new CustomError1(400, "Coupon usage limit has been reached.");
                }

                if (coupon.min_order_value > 0 && paymentObject.totalAmount < coupon.min_order_value) {
                    throw new CustomError1(400, `Minimum order value for this coupon is ${coupon.min_order_value}.`);
                }

                const currentDiscount = Math.min(
                    (paymentObject.totalAmount * (coupon.discount_percentage / 100)),
                    coupon.max_discounted_amount > 0 ? coupon.max_discounted_amount : paymentObject.totalAmount
                );

                discount += currentDiscount;

                if (["limit", "both"].includes(coupon.type)) {
                    coupon.limit -= 1;
                    await coupon.save();
                }
            }

            paymentObject.finalAmount = paymentObject.finalAmount - discount;
            paymentObject.discountAmount = discount;
        }

        
        cart.payment = paymentObject;
        cart.coupons = coupons;
        cart.save();
        createResponse(null, 200, "Coupon Applied.", res)

    } catch (error) {
        errorHandler(error, req, res)
    }
}










