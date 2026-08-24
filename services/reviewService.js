const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const Review = require('../models/reviewModel');

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/protected/User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/protected/User
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/protected/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);
