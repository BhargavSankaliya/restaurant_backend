const jwt = require("jsonwebtoken");
const createResponse = require("./response");
const MasterUserModel = require("../models/userModel");
require('dotenv').config();

async function auth(req, res, next) {
    if (!!req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) {
                console.log(err);
                return createResponse(null, 401, "Unauthorization", res)
            } else {
                let masterUser = await MasterUserModel.findById(decoded.id)
                if (!masterUser || masterUser?.status != "Active" || masterUser?.isDeleted == true) {
                    return createResponse(null, 401, "Unauthorization", res)
                }
                req.masterUser = masterUser
                next();
            }
        });
    } else {
        console.log("Token", req.headers);
        return createResponse(null, 404, "Please enter authorization token", res)
    }
}

module.exports = auth;