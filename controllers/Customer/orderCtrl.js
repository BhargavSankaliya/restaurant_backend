const { CustomError1, errorHandler1 } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const OrderModel = require("../../models/orderModel.js");
const CouponModel = require("../../models/couponModel.js");
const AddToCartModel = require("../../models/addToCartModel.js");
const { convertIdToObjectId, commonFilter } = require("../../middlewares/commonFilter.js");
const { Emitter } = require('../../events/eventEmmiter.js');
const { userSockets } = require('../../socket.js');
const { EVENTS } = require('../../middlewares/events.js');


exports.customerPlaceOrder = async (req, res) => {
    try {
        const {
            restaurantId,
            items,
            totalAmount,
            couponCode,
            couponId,
            tableId,
            tableNumber,
            dining,
            takeaway,
            pickupAddress,
            deliveryAddress,
            altogether
        } = req.body;

        const userId = req.customer._id;

        if (!items || items.length === 0) {
            throw new CustomError1(400, "Cart is empty. Cannot place order.");
        }

        let discount = 0;
        let finalAmount = totalAmount;

        if (couponCode && couponId) {
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

            if (totalAmount < coupon.min_order_value) {
                throw new CustomError1(400, `Minimum order value for this coupon is ${coupon.min_order_value}.`);
            }

            discount = Math.min((totalAmount * (coupon.discount_percentage / 100)), coupon.max_discounted_amount || totalAmount);
            finalAmount = totalAmount - discount;

            if (["limit", "both"].includes(coupon.type)) {
                coupon.limit -= 1;
                await coupon.save();
            }
        }

        if (altogether) {
            items.forEach((val) => {
                val.status = "Preparing";
            });
        }

        const order = new OrderModel({
            userId: convertIdToObjectId(userId),
            restaurantId: convertIdToObjectId(restaurantId),
            tableId: tableId ? convertIdToObjectId(tableId) : null,
            tableNumber,
            dining,
            takeaway,
            pickupAddress,
            deliveryAddress,
            altogether,
            items,
            totalAmount,
            discount,
            finalAmount,
            couponId: couponId ? convertIdToObjectId(couponId) : null,
            couponCode: couponCode || null,
            status: altogether ? "Preparing" : "Pending"
        });

        await order.save();

        await AddToCartModel.deleteMany({ userId: convertIdToObjectId(userId), restaurantId: convertIdToObjectId(restaurantId) });

        const staticUserId = '675ed4470d6aecc98c38cb6d';
        const socketIds = userSockets.get(staticUserId);

        if (socketIds) {
            for (const socketId of socketIds) {
                Emitter.emit(EVENTS.ORDER_PLACED, {
                    socketId,
                    data: order,
                    message: "Order placed successfully."
                });
            }
        }

        createResponse(order, 200, "Order placed successfully.", res);
    } catch (error) {
        console.log("Error", error);
        errorHandler1(error, req, res);
    }
};


exports.getCustomerOrderHistory = async (req, res) => {
    try {
        const userId = req.customer._id;

        const orders = await OrderModel.aggregate([
            {
                $match: { userId },
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurant",
                },
            },
            {
                $lookup: {
                    from: "items",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "menuItems",
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $project: {
                    orderId: "$_id",
                    restaurantName: { $arrayElemAt: ["$restaurant.name", 0] },
                    items: {
                        $map: {
                            input: "$items",
                            as: "orderItem",
                            in: {
                                name: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$menuItems",
                                                        as: "menuItem",
                                                        cond: { $eq: ["$$menuItem._id", "$$orderItem.itemId"] },
                                                    },
                                                },
                                                as: "menuItem",
                                                in: "$$menuItem.name",
                                            },
                                        },
                                        0,
                                    ],
                                },
                                description: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$menuItems",
                                                        as: "menuItem",
                                                        cond: { $eq: ["$$menuItem._id", "$$orderItem.itemId"] },
                                                    },
                                                },
                                                as: "menuItem",
                                                in: "$$menuItem.description",
                                            },
                                        },
                                        0,
                                    ],
                                },
                                image: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$menuItems",
                                                        as: "menuItem",
                                                        cond: { $eq: ["$$menuItem._id", "$$orderItem.itemId"] },
                                                    },
                                                },
                                                as: "menuItem",
                                                in: "$$menuItem.image",
                                            },
                                        },
                                        0,
                                    ],
                                },
                                quantity: "$$orderItem.quantity",
                                itemPrice: {
                                    $toDouble: {
                                        $ifNull: [
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $map: {
                                                            input: {
                                                                $filter: {
                                                                    input: "$menuItems",
                                                                    as: "menuItem",
                                                                    cond: { $eq: ["$$menuItem._id", "$$orderItem.itemId"] },
                                                                },
                                                            },
                                                            as: "menuItem",
                                                            in: "$$menuItem.price",
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                            0,
                                        ],
                                    },
                                },
                                totalPrice: {
                                    $multiply: [
                                        "$$orderItem.quantity",
                                        {
                                            $toDouble: {
                                                $ifNull: [
                                                    {
                                                        $arrayElemAt: [
                                                            {
                                                                $map: {
                                                                    input: {
                                                                        $filter: {
                                                                            input: "$menuItems",
                                                                            as: "menuItem",
                                                                            cond: { $eq: ["$$menuItem._id", "$$orderItem.itemId"] },
                                                                        },
                                                                    },
                                                                    as: "menuItem",
                                                                    in: "$$menuItem.price",
                                                                },
                                                            },
                                                            0,
                                                        ],
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    totalAmount: 1,
                    discount: 1,
                    finalAmount: 1,
                    createdAt: 1,
                },
            },
        ]);

        if (!orders || orders.length === 0) {
            return createResponse([], 200, "No orders found.", res);
        }

        createResponse(orders, 200, "Customer order history retrieved successfully.", res);
    } catch (error) {
        console.error("Error in getCustomerOrderHistory:", error);
        errorHandler1(error, req, res);
    }
};






