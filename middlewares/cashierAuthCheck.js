const jwt = require("jsonwebtoken");
const createResponse = require("./response");
const CashierModel = require("../models/CashierModel");
require('dotenv').config();

async function auth(req, res, next) {
    if (!!req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) {
                console.log(err);
                return createResponse(null, 401, "Unauthorization", res)
            } else {
                let cashier = await CashierModel.findById(decoded.id)
                if (!cashier || cashier?.status != "Active" || cashier?.isDeleted == true) {
                    return createResponse(null, 401, "Unauthorization", res)
                }
                req.cashier = cashier
                next();
            }
        });
    } else {
        console.log("Token", req.headers);
        return createResponse(null, 404, "Please enter authorization token", res)
    }
}

module.exports = auth;