const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const User = require('../models/userModel');

//Upload single image
exports.uploadUserImage = uploadSingleImage('image');

//Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .toFile(`uploads/categories/${filename}`);
    
    req.body.image = filename;
    next();
})
// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST  /api/v1/Users
// @access  Private
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = factory.updateOne(User);

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);
