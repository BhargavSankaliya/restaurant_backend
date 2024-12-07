const { default: mongoose } = require("mongoose");

const commonFilter = {};

// jetla table create thay enu common projection setup karvu ahiya
// start

commonFilter.roleMasterObject = {
    _id: 1,
    roleName: 1,
    status: 1,
    permissions: 1,
}

commonFilter.userMasterObject = {
    _id: 1,
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    isVerified: 1,
    gender: 1,
    address: 1,
    coverPicture: 1,
    profilePicture: 1,
    role: 1,
    roleName: 1,
    status: 1,
    createdAt: 1,
}


// end

// pagination setup start
commonFilter.paginationCalculation = async (list, limit, page) => {
    return {
        currentPage: page,
        limit: limit,
        isLastPage: list.length >= limit ? false : true
    }
}
// pagination setup end

const convertIdToObjectId = (id) => {
    return new mongoose.Types.ObjectId(id.toString());
};

module.exports = { commonFilter, convertIdToObjectId };