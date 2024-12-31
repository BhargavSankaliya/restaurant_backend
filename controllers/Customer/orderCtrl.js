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
            coupons,
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

            finalAmount = totalAmount - discount;
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
            coupons: coupons.map(({ couponId, couponCode }) => ({
                couponId: couponId ? convertIdToObjectId(couponId) : null,
                couponCode: couponCode || null,
            })),
            payment: {
                totalAmount,
                discountAmount: discount,
                finalAmount,
                tipAmount: 0,
                gst: 0,
            },
            status: altogether ? "Preparing" : "Pending",
            orderBy: req.customer.source || "customer",
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
                $lookup: {
                    from: "coupons",
                    localField: "coupons.couponId",
                    foreignField: "_id",
                    as: "appliedCoupons",
                },
            },
            {
                $lookup: {
                    from: "tables",
                    localField: "tableId",
                    foreignField: "_id",
                    as: "tableDetails",
                },
            },
            {
                $lookup: {
                    from: "modifiers",
                    localField: "items.modifiers",
                    foreignField: "_id",
                    as: "modifierDetails",
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $project: {
                    orderId: "$_id",
                    restaurantName: { $arrayElemAt: ["$restaurant.name", 0] },
                    tableNumber: { $arrayElemAt: ["$tableDetails.tableNumber", 0] },
                    pickupAddress: 1,
                    deliveryAddress: 1,
                    dining: 1,
                    takeaway: 1,
                    altogether: 1,
                    orderBy: 1,
                    status: 1,
                    payment: 1,
                    coupons: {
                        $map: {
                            input: "$appliedCoupons",
                            as: "coupon",
                            in: {
                                couponId: "$$coupon._id",
                                name: "$$coupon.name",
                                file: "$$coupon.file",
                                couponCode: "$$coupon.code",
                                discountType: "$$coupon.type",
                                min_order_value: "$$coupon.min_order_value",
                                discount_percentage: "$$coupon.discount_percentage",
                                max_discounted_amount: "$$coupon.max_discounted_amount",
                                expirationDate: "$$coupon.expirationDate",
                                description: "$$coupon.description",
                            },
                        },
                    },
                    items: {
                        $map: {
                            input: "$items",
                            as: "orderItem",
                            in: {
                                id: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item._id",
                                    },
                                },
                                name: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.name",
                                    },
                                },
                                description: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.description",
                                    },
                                },
                                image: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.image",
                                    },
                                },
                                spiceLevel: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.spiceLevel",
                                    },
                                },
                                status: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.status",
                                    },
                                },
                                options: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.options",
                                    },
                                },
                                choices: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: [
                                                    "$menuItems",
                                                    {
                                                        $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                    },
                                                ],
                                            },
                                        },
                                        in: "$$item.choices",
                                    },
                                },
                                quantity: "$$orderItem.quantity",
                                itemPrice: {
                                    $toDouble: {
                                        $ifNull: [
                                            {
                                                $let: {
                                                    vars: {
                                                        item: {
                                                            $arrayElemAt: [
                                                                "$menuItems",
                                                                {
                                                                    $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    in: "$$item.price",
                                                },
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
                                                        $let: {
                                                            vars: {
                                                                item: {
                                                                    $arrayElemAt: [
                                                                        "$menuItems",
                                                                        {
                                                                            $indexOfArray: ["$menuItems._id", "$$orderItem.itemId"],
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            in: "$$item.price",
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                    ],
                                },
                                modifiers: {
                                    $map: {
                                        input: "$modifierDetails",
                                        as: "modifier",
                                        in: {
                                            modifierName: "$$modifier.additionalItemName",
                                            description: "$$modifier.description",
                                            price: "$$modifier.price",
                                            image: "$$modifier.image",
                                        },
                                    },
                                },
                            },
                        },
                    },
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






















