const { CustomError, errorHandler } = require("../../middlewares/error.js");
const createResponse = require("../../middlewares/response.js");
const masterAdminModuleMasterModel = require("../../models/moduleMasterModel.js");
const moduleMasterCtrl = {};


moduleMasterCtrl.createNewModule = async (req, res, next) => {
  try {
    const { name } = req?.body;
    const findModule = await masterAdminModuleMasterModel.findOne({ name, isDeleted: false });
    if (findModule) {
      throw new CustomError("Module already exists!", 400);
    }
    const newModuleCreated = await masterAdminModuleMasterModel.create(req?.body);
    createResponse(newModuleCreated, 200, "New Module created successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

moduleMasterCtrl.updateModule = async (req, res, next) => {
  try {
    let { id, name, value } = req?.body;

    const Module = await masterAdminModuleMasterModel.findById(id);
    if (!Module) {
      throw new CustomError("Module not found!", 404);
    }

    const existingModule = await masterAdminModuleMasterModel.findOne({
      name: name,
      _id: { $ne: id },
    });

    if (existingModule) {
      throw new CustomError("Module name already exists!", 400);
    }

    let updatedModuleData = await masterAdminModuleMasterModel.findOneAndUpdate(
      { _id: id },
      { name: name, value: value },
      { new: true }
    );

    createResponse(updatedModuleData, 200, "Module updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};


moduleMasterCtrl.getModuleList = async (req, res, next) => {
  try {
    const { status, serchKey } = req?.body;
    const page = parseInt(req?.body?.page) || 1;
    const limit = parseInt(req?.body?.limit) || 10;
    const skip = (page - 1) * limit;

    let queryCondition = {
      isDeleted: false
    };

    if (status === 'Active') {
      queryCondition = { status: 'Active' };
    } else if (status === 'Inactive') {
      queryCondition = { status: 'Inactive' };
    } else if (status) {
      throw new CustomError("Invalid status. Module 'active' or 'inactive'.", 400);
    }

    if (serchKey) {
      queryCondition = {
        name: { $regex: serchKey, $options: 'i' }
      };
    }

    const modules = await masterAdminModuleMasterModel.find(queryCondition).skip(skip).limit(limit);
    const totalModules = await masterAdminModuleMasterModel.countDocuments(queryCondition);

    const response = {
      totalModules,
      totalPages: Math.ceil(totalModules / limit),
      currentPage: page,
      modules,
    };

    createResponse(response, 200, "modules retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

moduleMasterCtrl.toggleModuleStatus = async (req, res, next) => {
  try {
    const { status, id } = req?.body;

    if (status !== 'Active' && status !== 'Inactive') {
      throw new CustomError("Invalid status. Use 'active' or 'inactive'.", 400);
    }

    const Module = await masterAdminModuleMasterModel.findById(id);
    if (!Module) {
      throw new CustomError("Module not found!", 404);
    }

    Module.status = status;
    await Module.save();

    createResponse(Module, 200, "Module status updated successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

moduleMasterCtrl.getModuleById = async (req, res, next) => {
  try {
    const { id } = req?.body;

    const moduleMasterData = await masterAdminModuleMasterModel.findById(id);
    if (!moduleMasterData) {
      throw new CustomError("Module not found!", 404);
    }

    createResponse(moduleMasterData, 200, "Module retrieved successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

moduleMasterCtrl.moduleDelete = async (req, res, next) => {
  try {
    const { id } = req?.body;

    const Module = await masterAdminModuleMasterModel.findById(id);
    if (!Module) {
      throw new CustomError("Module not found!", 404);
    }

    Module.isDeleted = true;
    await Module.save();

    createResponse(Module, 200, "Module deleted successfully.", res);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { moduleMasterCtrl }
