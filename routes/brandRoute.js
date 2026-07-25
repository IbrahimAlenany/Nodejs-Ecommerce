const express = require('express');
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadCategoryImage,
  resizeImage,
} = require('../services/brandService');

const router = express.Router();

router.route('/')
.get(getBrands)
.post(uploadCategoryImage,
  resizeImage,
  createBrandValidator,
  createBrand);
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(uploadCategoryImage,
    resizeImage,
    updateBrandValidator,
    updateBrand)
  .delete(deleteBrandValidator, deleteBrand);

module.exports = router;
