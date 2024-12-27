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
commonFilter.restaurantRoleObject = {
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
    parentName: "$menuDetails.parentName",
    status: "$menuDetails.status",
    isDeleted: "$menuDetails.isDeleted",
    createdAt: "$menuDetails.createdAt",
    updatedAt: "$menuDetails.updatedAt",
}
commonFilter.menuMasterObject = {
    _id: 1,
    name: 1,
    url: 1,
    parentName: 1,
    icon: 1,
    status: 1,
}
commonFilter.restaurantMenuObject = {
    _id: 1,
    name: 1,
    url: 1,
    icon: 1,
    status: 1,
    parentName: 1
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
    roleId: 1,
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

commonFilter.couponMasterObj = {
    _id: 1,
    name: 1,
    code: 1,
    type: 1,
    limit: 1,
    start_date: 1,
    end_date: 1,
    file: 1,
    min_order_value: 1,
    discount_percentage: 1,
    max_discounted_amount: 1,
    createdAt: 1,
    updatedAt: 1
}

commonFilter.OfferMasterObj = {
    _id: 1,
    description: 1,
    code: 1,
    type: 1,
    limit: 1,
    start_date: 1,
    end_date: 1,
    min_order_value: 1,
    discount_percentage: 1,
    max_discounted_amount: 1,
    createdAt: 1,
    updatedAt: 1
}

commonFilter.restaurantStockManagementObj = {
    _id: 1,
    name: 1,
    description: 1,
    image: 1,
    quantity: 1,
    unit: 1,
    minThreshold: 1,
    purchasePrice: 1,
    sellPrice: 1,
    expiryDate: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.restaurantHistoryObj = {
    _id: 1,
    quantityConsumed: 1,
    remarks: 1,
    performedBy: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.serviceMasterObj = {
    _id: 1,
    name: 1,
    description: 1,
    image: 1,
    status: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.languageMasterObj = {
    _id: 1,
    name: 1,
    direction: 1,
    status: 1,
    localeField: 1,
    isDeleted: 1,
    createdAt: 1
}

commonFilter.staffMasterObj = {
    _id: 1,
    firstName: 1,
    lastName: 1,
    image: 1,
    email: 1,
    mobile: 1,
    gender: 1,
    address: 1,
    country: 1,
    state: 1,
    city: 1,
    postCode: 1,
    userId: 1,
    pin: 1,
    salary: 1,
    salaryType: 1,
    status: 1,
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

commonFilter.itemObj = {
    _id: 1,
    name: 1,
    price: 1,
    image: 1,
    status: 1,
    categoryName: "$categoryData.name"
}
commonFilter.reastaurantTable = {
    _id: 1,
    tableNumber: 1,
    name: 1,
    capacity: 1,
    openTime: 1,
    qrcode: 1,
    status: 1,
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