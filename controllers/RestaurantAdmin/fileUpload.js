
const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const config = require("../../environmentVariable.json")

exports.FileUpload = async (req, res, next) => {
    try {
        const file = [];
        const configURL = config.URL;

        let ingredienceImage = ""
        let cuisineImage = ""
        let categoryImage = ""
        let modifierImage = ""
        let restaurantMenuIcon = ""
        let restaurantServiceImage = ""
        let restaurantStockImage = ""
        let posterImage = ""
        let couponFile = ""
        let staffDocument = ""

        if (!req?.files) {
            throw new CustomError("Please upload file", 400);

        }

        if (req.files && !!req.files.ingredienceImage && req.files.ingredienceImage.length > 0) {
            req.files.ingredienceImage.map((x) => {
                ingredienceImage = configURL + x.destination + "/" + x.filename
            })
        }

        if (req.files && !!req.files.cuisineImage && req.files.cuisineImage.length > 0) {
            req.files.cuisineImage.map((x) => {
                cuisineImage = configURL + x.destination + "/" + x.filename
            })
        }

        if (req.files && !!req.files.categoryImage && req.files.categoryImage.length > 0) {
            req.files.categoryImage.map((x) => {
                categoryImage = configURL + x.destination + "/" + x.filename
            })
        }

        if (req.files && !!req.files.modifierImage && req.files.modifierImage.length > 0) {
            req.files.modifierImage.map((x) => {
                modifierImage = configURL + x.destination + "/" + x.filename
            })
        }

        if (req.files && !!req.files.restaurantMenuIcon && req.files.restaurantMenuIcon.length > 0) {
            req.files.restaurantMenuIcon.map((x) => {
                restaurantMenuIcon = configURL + x.destination + "/" + x.filename
            })
        }

        if (req.files && !!req.files.restaurantServiceImage && req.files.restaurantServiceImage.length > 0) {
            req.files.restaurantServiceImage.map((x) => {
                restaurantServiceImage = configURL + x.destination + "/" + x.filename
            })
        }

        if (req.files && !!req.files.restaurantStockImage && req.files.restaurantStockImage.length > 0) {
            req.files.restaurantStockImage.map((x) => {
                restaurantStockImage = configURL + x.destination + "/" + x.filename
            })
        }
        if (req.files && !!req.files.posterImage && req.files.posterImage.length > 0) {
            req.files.posterImage.map((x) => {
                posterImage = configURL + x.destination + "/" + x.filename
            })
        }
        if (req.files && !!req.files.couponFile && req.files.couponFile.length > 0) {
            req.files.couponFile.map((x) => {
                couponFile = configURL + x.destination + "/" + x.filename
            })
        }
        if (req.files && !!req.files.staffDocument && req.files.staffDocument.length > 0) {
            req.files.staffDocument.map((x) => {
                staffDocument = configURL + x.destination + "/" + x.filename
            })
        }

        createResponse({
            ingredienceImage, cuisineImage, categoryImage, modifierImage, restaurantMenuIcon, restaurantServiceImage, restaurantStockImage, posterImage, couponFile, staffDocument
        }, 200, 'File Upload Successfully.', res)

    } catch (error) {
        console.log(error);

        errorHandler(error, res, res)
    }
}