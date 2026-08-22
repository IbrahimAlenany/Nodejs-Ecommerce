const express = require('express');

const {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} = require('../services/subCategoryService');

const authServices = require('../services/authService');

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require('../utils/validators/subCategoryValidator');

// mergeParams: Allow us to access parameters on other routers
// ex: We need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authServices.protect,
    authServices.allowedTo('admin','manager'),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory)
  .get(createFilterObj, getSubCategories);
router
  .route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authServices.protect,
    authServices.allowedTo('admin','manager'),
    updateSubCategoryValidator,
    updateSubCategory)
  .delete(
    authServices.protect,
    authServices.allowedTo('admin'),
    deleteSubCategoryValidator,
    deleteSubCategory);

module.exports = router;
