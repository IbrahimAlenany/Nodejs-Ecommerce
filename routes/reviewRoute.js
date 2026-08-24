const express = require('express');
//const {
//   getBrandValidator,
//   createBrandValidator,
//   updateBrandValidator,
//   deleteBrandValidator,
//} = require('../utils/validators/brandValidator');

const authServices = require('../services/authService');

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../services/reviewService');

const router = express.Router();


router.route('/')
.get(getReviews)
.post(
  authServices.protect,
  authServices.allowedTo('user'),
createReview,);
router
  .route('/:id')
  .get(getReview)
  .put(
    authServices.protect,
    authServices.allowedTo('user'),
    updateReview)
  .delete(
  authServices.protect,
  authServices.allowedTo('user'),
  deleteReview);

module.exports = router;
