const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const RestaurantModel = require("../../models/restaurantModel.js");
const niv = require("node-input-validator");


exports.login = async (req, res) => {
    try {
        const { email, password } = req?.body;
        const objValidation = new niv.Validator(req.body, {
            email: "required", 
            password: "required", 
        });
        const matched = await objValidation.check();
        if (!matched) {
            return res
                .status(422)
                .send({ message: "Validation error", errors: objValidation.errors });
        }

        const user = await RestaurantModel.findOne({ email });
        if (!user) {
            throw new CustomError("Invalid email or password", 400);
        }
        const isPasswordValid = await bcrypt.compare(password, user?.password);
        if (!isPasswordValid) {
            throw new CustomError("Invalid email or password", 400);
        }

        const roleDetails = await RoleMasterModel.findById(user?.role);
        if (!roleDetails) {
            throw new CustomError("Role details not found", 404);
        }

        

        user.token = token;
        user.save()

        const response = {
            user: {
                id: user?._id,
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                phone: user?.phone,
                gender: user?.gender,
                role: {
                    id: user?.role,
                    roleName: roleDetails?.roleName,
                    permissions: roleDetails?.permissions,
                },
            },
            token,
        };

        createResponse(response, 200, "Login successful", res);
    } catch (error) {
        errorHandler(error, req, res);
    }
}
