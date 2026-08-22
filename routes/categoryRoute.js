const express = require('express');
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require('../services/categoryService');

const authServices = require('../services/authService');

const subcategoriesRoute = require('./subCategoryRoute');

const router = express.Router();

router.use('/:categoryId/subcategories', subcategoriesRoute);

router
  .route('/')
  .get(getCategories)
  .post(
  authServices.protect,
  authServices.allowedTo('admin','manager'),
  uploadCategoryImage,
  resizeImage,
  createCategoryValidator,
  createCategory);
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(
  authServices.protect,
  authServices.allowedTo('admin','manager'),
  uploadCategoryImage,
  resizeImage,
  updateCategoryValidator,
  updateCategory)
  .delete(
    authServices.protect,
    authServices.allowedTo('admin'),
    deleteCategoryValidator,
    deleteCategory);

module.exports = router;
