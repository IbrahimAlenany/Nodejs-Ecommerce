const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');

exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .isLength({ max: 32 })
    .withMessage('Too long User name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('Email Required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) => 
    User.findOne( { email: val} ).then((user) => {
      if (user) {
        return Promise.reject(new Error('E-mail already in user'));
      }
    })
  ),

  check('password')
    .notEmpty()
    .withMessage('password Required')
    .isLength( { min : 6 } )
    .withMessage('password must be at least 6 characters')
    .custom((password, { req }) => {
      if(password !== req.body.passwordConfirm) {
        throw new Error('password Confirmation in correct')
      }
      return true;
    }),

  check('passwordConfirm')
  .notEmpty()
  .withMessage('password confirmation required'),

  validatorMiddleware,
];

