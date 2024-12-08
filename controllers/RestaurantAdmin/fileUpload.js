
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const config = require("../../environmentVariable.json")

exports.FileUpload = async (req, res, next) => {
    try {
        const file = [];
        const configURL = config.URL;

        let ingredienceImage = ""

        if (!req?.files) {
            throw new CustomError("Please upload file", 400);

        }

        if (req.files && !!req.files.ingredienceImage && req.files.ingredienceImage.length > 0) {
            req.files.ingredienceImage.map((x) => {
                ingredienceImage = configURL + x.destination + "/" + x.filename
            })
        }

        createResponse({
            ingredienceImage
        }, 200, 'File Upload Successfully.', res)

    } catch (error) {
        console.log(error);

        errorHandler(error, res, res)
    }
}