const jwt = require("jsonwebtoken");
const createResponse = require("./response");
require('dotenv').config();

async function auth(req, res, next) {
    if (!!req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                return createResponse(null, 401, "Unauthorization", res)
            } else {
                // req.userId = decoded.tokenDetailse._id
                // req.email = decoded.tokenDetailse.email
                // console.log("decoded", decoded.tokenDetailse);
                next();
            }
        });
    } else {
        console.log("Token", req.headers);
        return createResponse(null, 404, "Please enter authorization token", res)
    }
}

module.exports = auth;