const jwt = require("jsonwebtoken");
require('dotenv').config();

async function auth(req, res, next) {
    if (!!req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                res.json({
                    meta: {
                        code: 404,
                        message: "InValid Authoriza Token"
                    }
                })
            } else {
                // req.userId = decoded.tokenDetailse._id
                // req.email = decoded.tokenDetailse.email
                // console.log("decoded", decoded.tokenDetailse);
                next();
            }
        });
    } else {
        console.log("Token", req.headers);
        res.json({
            meta: {
                code: 404,
                message: "Please Enter Authoriza Token"
            }
        })
    }
}

module.exports = auth;