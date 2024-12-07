
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const config = require("../../environmentVariable.json")

exports.FileUpload = async (req, res, next) => {
    try {
        const file = [];
        const configURL = config.URL;

        let restaurantLogo = '';
        let restaurantMedia = ""
        let legalDoc = ""

        if (!req?.files) {
            throw new CustomError("Please upload file", 400);

        }

        if (req.files && !!req.files.restaurantLogo && req.files.restaurantLogo.length > 0) {
            req.files.restaurantLogo.map((x) => {
                restaurantLogo = configURL + x.destination + "/" + x.filename
            })
        }
        if (req.files && !!req.files.restaurantMedia && req.files.restaurantMedia.length > 0) {
            req.files.restaurantMedia.map((x) => {
                restaurantMedia = configURL + x.destination + "/" + x.filename
            })
        }
        if (req.files && !!req.files.legalDoc && req.files.legalDoc.length > 0) {
            req.files.legalDoc.map((x) => {
                
                legalDoc = configURL + x.destination + "/" + x.filename
            })
        }


        createResponse({
            restaurantLogo, restaurantMedia, legalDoc
        }, 200, 'File Upload Successfully.', res)

    } catch (error) {
        console.log(error);

        errorHandler(error, res, res)
    }
}