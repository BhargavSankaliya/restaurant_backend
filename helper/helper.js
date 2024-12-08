const bcrypt = require("bcrypt")
require("dotenv").config()
const jwt =require("jsonwebtoken")

exports.bcyptPass = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.comparePassword = async (password,bcyptPass) => {
    try {
        return await bcrypt.compare(password, bcyptPass);
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.createJWT = async (id, email, role) => {
    try {
        return jwt.sign(
            { id: id, email: email, roleId: role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.expiresIn }
        );
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.generateRandomString = (length, isNumber = false) => {
    var result = "";
    if (isNumber) {
        var characters = "0123456789";
    } else {
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
