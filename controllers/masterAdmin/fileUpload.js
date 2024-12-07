
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");

exports.FileUpload = async (req, res, next) => {
    try {
        const file = [];
        const configURL = config.URL;

        let restaurantLogo = '';
        let restaurantMedia = ""

        if (req.files && !!req.files.restaurantLogo && req.files.restaurantLogo.length > 0) {
            req.files.restaurantLogo.map((x) => {
                restaurantLogo = configURL + x.destination + "/" + x.filename
            })
        }
        if (req.files && !!req.files.restaurantMedia && req.files.restaurantMedia.length > 0) {
            req.files.restaurantMedia.map((x) => {
                restaurantLogo = configURL + x.destination + "/" + x.filename
            })
        }


        createResponse({
            restaurantLogo, restaurantMedia
        }, 200, 'File Upload Successfully.', res)

    } catch (error) {
        errorHandler(error, res, res)
    }
}