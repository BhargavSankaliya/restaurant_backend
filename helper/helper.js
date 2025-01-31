const bcrypt = require("bcrypt")
const { json } = require("express")
require("dotenv").config()
const jwt = require("jsonwebtoken")
let QRCode = require('qrcode')
let fs = require("fs")
let path = require("path")

exports.bcyptPass = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.comparePassword = async (password, bcyptPass) => {
    try {
        return await bcrypt.compare(password, bcyptPass);
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.createJWT = async (id, email = "", role = "") => {
    try {
        let data = {
            id: id, email: email,
        }
        if (role) data.roleId = role
        return jwt.sign(
            data,
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




exports.QRCodeGen = async (data, id) => {
    try {
        let startPoint = "./";
        let filePath = `uploads/restaurant/${data.restaurantId}/QR/`;
        let filename = `${Date.now()}_qr.png`
        let file = startPoint + filePath + filename;

        const dirPath = startPoint + filePath;
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        let qrcode = process.env.FRONTENDURL + `?tableId=${data._id ? data._id : id}&restaurantId=${data.restaurantId}`

        const jsonData = JSON.stringify(data);

        await QRCode.toFile(file, qrcode, {
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        let fileUrl = process.env.URL + filePath + filename;
        return fileUrl;
    } catch (error) {
        throw new Error(error.message);
    }
};
