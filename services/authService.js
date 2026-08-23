const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail')
const User = require('../models/userModel');

const createToken = (userId) => 
    jwt.sign(
        { userId },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRE_TIME,
        }
    );
exports.signup = asyncHandler(async (req, res, next) => {
    // 1-Create user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })

    //2-Generate token
    const token = createToken(user._id);

    res.status(201).json({ data: user, token})
});

exports.login = asyncHandler(async (req, res, next) => {
    //1-check if password and email in the body
    //2-check if user exist & check if password is correct
    const user = await User.findOne({ email: req.body.email });

    if(!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(ApiError('Incorrect email or password'));
    }
    //3-generate token 
    const token = createToken(user._id);
    //4-send response to client side
    res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
    //1-check if token exist, if exist get
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return next(
            new ApiError(
                'You are not login, please login to get access this route',
                401
            )
        );
    }

    // 2-verify token (no change happens, expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);

    //3-check if user exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(
            new ApiError(
                'The user that belong to this token does no longer exist',
                401
            )
        );
    }

    //4-check if user change his password after token created
    if(currentUser.passwordChangedAt) {
        const passchangedTimestamp = parseInt(
            currentUser.passwordChangedAt.getTime() / 1000,
        );
        //password changed after token created
        if (passchangedTimestamp > decoded.iat) {
            return next(
                new ApiError(
                    'user recently changed his password. please login again...',
                    401
                )
            );
        }
    }

    req.user = currentUser;
    next();
});

exports.allowedTo = (...roles) => 
    asyncHandler(async (req, res, next) => {
        //1-access roles
        //2-access registered user (req.user.role)
        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError('You are not allowed to access this route', 403)
            );
        }
        next();
    });

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    //1-Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new ApiError(`There is no user with that email ${req.body.email}`,404)
        );
    }
    //2-if user exists, Generate hash reset random 6 digits andsave it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

    //save hashed password reset code into db
    user.passwordResetCode = hashResetCode;
    //Add expiration time for password reset code 
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    const message = `Hi ${user.name}\n We received a request to reset the password on your E-shop Accountز \n ${resetCode}`;

    //3-send the reset code via email
    try{
    await sendEmail({
        email: user.email,
        subject: 'Your password rest code (valid for 10 min)',
        message,
    });
} catch (err) {
    user.passwordResetCode  = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError('there is an error in sending email',500))
}

    res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to email'})
});

exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    //1- Get user based on reset code
    const hashResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

    const user = await User.findOne({
        passwordResetCode: hashResetCode,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ApiError('Reset code invalid or expired'));
    }

    //2- Reset code valid
    user.passwordResetVerified = true;

    await user.save();

    res.status(200)
    .json({
        status: 'Success',
    });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1- Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new ApiError(`There is no user with email ${req.body.email}`,404)
        );
    }

    // 2- Check if reset code verified
    if (!user.passwordResetVerified) {
        return next(new ApiError('Reset code not verified', 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetCode  = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    // 3- if everything is ok, generate token
    const token = createToken(user._id);
    res.status(200).json({ token });
});
