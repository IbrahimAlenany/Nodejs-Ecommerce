const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcrypt');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const User = require('../models/userModel');

//Upload single image
exports.uploadUserImage = uploadSingleImage('image');

//Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    
    if(req.file) {
    await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .toFile(`uploads/categories/${filename}`);
    
    req.body.image = filename;
    }
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
exports.updateUser = asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            slug: req.body.slug,
            phone: req.body.phone,
            profileImg: req.body.profileImg,
            role: req.body.role,
        },
        {
            new: true,
        }
    );

    if(!document) {
        return next(new ApiError(`No document for this id ${req.params.id}, 404`));
    }
    res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(
        req.params.id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {
            new: true,
        }
    );

    if(!document) {
        return next(new ApiError(`No document for this id ${req.params.id}, 404`));
    }
    res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);
