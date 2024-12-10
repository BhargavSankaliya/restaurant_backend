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
commonFilter.roleMasterPermissionsObject = {
    menuId: "$permissions.menuId",
    permission: "$permissions.permission",
    name: "$menuDetails.name",
    icon: "$menuDetails.icon",
    url: "$menuDetails.url",
    status: "$menuDetails.status",
    isDeleted: "$menuDetails.isDeleted",
    createdAt: "$menuDetails.createdAt",
    updatedAt: "$menuDetails.updatedAt",
}
commonFilter.menuMasterObject = {
    _id: 1,
    name: 1,
    url: 1,
    icon: 1,
    status: 1,
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


commonFilter.restaurantMasterObj = {
    _id: 1,
    name: 1,
    capacity: 1,
    status: 1,
    address: 1,
    gstNumber: 1,
    phoneNumber: 1,
    email: 1,
    website: 1,
    logo: 1,
    media: 1,
    legalDoc: 1,
    openingHour: 1,
    createdAt: 1,
}

commonFilter.unitOfSalesMasterObj = {
    _id: 1,
    name: 1,
    description: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.ingredienceMasterObj = {
    _id: 1,
    name: 1,
    description: 1,
    status: 1,
    image: 1,
    isVeg: 1,
    isVegan: 1,
    isJain: 1,
    isSwaminarayan: 1,
    isNonVeg: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.cuisinesMasterObj = {
    _id: 1,
    name: 1,
    description: 1,
    image: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.modifierMasterObj = {
    _id: 1,
    additionalItemName: 1,
    description: 1,
    price: 1,
    image: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.kdsLookUp = {
    $lookup: {
        from: "categories",
        localField: "foodCategory",
        foreignField: "_id",
        as: "foodCategoryDetails",
    },
}

commonFilter.kdsMap = {
    foodCategory: {
        $map: {
            input: "$foodCategoryDetails",
            as: "category",
            in: { _id: "$$category._id", name: "$$category.name" },
        },
    },
}

commonFilter.kdsMasterObj = {
    _id: 1,
    name: 1,
    location: 1,
    isDefault: 1,
    foodCategory: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.categoryMasterObj = {
    _id: 1,
    name: 1,
    description: 1,
    image: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
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