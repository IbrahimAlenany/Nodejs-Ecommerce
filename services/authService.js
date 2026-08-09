const jwt = require('jsonwebtoken');

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');

exports.signup = asyncHandler(async (req, res, next) => {
    // 1-Create user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })

    //2-Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn : process.env.JWT_EXPIRE_TIME,
    });

    res.status(201).json({ data: user, token})
});