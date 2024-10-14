
const commonFilter = {};

// jetla table create thay enu common projection setup karvu ahiya
// start



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