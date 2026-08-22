const express = require('express');
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');

const authServices = require('../services/authService');

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require('../services/brandService');

const router = express.Router();


router.route('/')
.get(getBrands)
.post(
  authServices.protect,
  authServices.allowedTo('admin','manager'),
  uploadBrandImage,
  resizeImage,
  createBrandValidator,
  createBrand);
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    authServices.protect,
    authServices.allowedTo('admin','manager'),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand)
  .delete(
  authServices.protect,
  authServices.allowedTo('admin'),
  deleteBrandValidator,
  deleteBrand);

module.exports = router;
