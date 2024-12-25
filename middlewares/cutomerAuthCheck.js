const jwt = require("jsonwebtoken");
const createResponse = require("./response");
const CustomerModel = require("../models/customerModel");
require('dotenv').config();

async function auth(req, res, next) {
    if (!!req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) {
                console.log(err);
                return createResponse(null, 401, "Unauthorization", res)
            } else {
                let customer = await CustomerModel.findById(decoded.id)
                if (!customer || customer?.status != "Active" || customer?.isDeleted == true) {
                    return createResponse(null, 401, "Unauthorization", res)
                }
                req.customer = customer
                next();
            }
        });
    } else {
        console.log("Token", req.headers);
        return createResponse(null, 404, "Please enter authorization token", res)
    }
}

module.exports = auth;