const express = require('express');
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator');

const authServices = require('../services/authService');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require('../services/productService');

const router = express.Router();

router.route('/')
.get(getProducts)
.post(
  authServices.protect,
  authServices.allowedTo('admin','manager'),
  uploadProductImages,
  resizeProductImages,
  createProductValidator,
  createProduct);
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(
  authServices.protect,
  authServices.allowedTo('admin','manager'),
  uploadProductImages,
  resizeProductImages,
  updateProductValidator,
  updateProduct)
  .delete(
    authServices.protect,
    authServices.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct);

module.exports = router;
