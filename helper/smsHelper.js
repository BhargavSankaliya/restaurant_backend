const config = require("../environmentVariable.json");
const { errorHandler } = require('../middlewares/error');

exports.sendSms = async (data, req, res) => {
    try {
        let { countryCode, phoneNumber, otp} = data

    } catch (error) {
        errorHandler(error, req, res)
    }
}